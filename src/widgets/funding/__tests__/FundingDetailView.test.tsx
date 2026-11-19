import { createElement, type ReactElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { useFundingContributionStore } from "@/store/fundingContributionStore";
import FundingDetailView from "@/widgets/funding/FundingDetailView";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

// 앞 단계 시트는 열어 둔 채 위에 쌓이므로 같은 이름의 버튼은 마지막(가장 위) 것을 누른다
// 입금 확인 시트가 확인 대기 목록을 조회하므로 QueryClient와 빈 목록 응답을 준비한다
const server = setupServer(
  http.get("*/api/fundings/:fundingId/contributions/pending", () =>
    HttpResponse.json({
      success: true,
      data: { pendingContributionCount: 0, contributions: [] },
      error: null,
    }),
  ),
);

beforeAll(() => server.listen());
afterAll(() => server.close());

const render = (ui: ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return rtlRender(ui, { wrapper });
};

const clickTopmost = async (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getAllByRole("button", { name }).at(-1)!);

// 금액 입력 → 편지 작성까지 진행해 비밀번호 시트 직전 단계로 간다
const goToPasswordSheet = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ }));
  await user.click(screen.getByRole("button", { name: "보태기" }));
  await user.type(await screen.findByRole("textbox", { name: "보탬 금액" }), "50000");
  await clickTopmost(user, "다음");

  const letter = await screen.findByRole("textbox", { name: "편지 내용" });
  // plaintext-only는 user-event가 편집 가능으로 보지 않아 내용을 넣고 input 이벤트를 직접 발생시킨다
  letter.textContent = "생일 축하해!";
  fireEvent.input(letter);
  await user.type(screen.getByRole("textbox", { name: "친구에게 보여질 이름" }), "민수");
  await clickTopmost(user, "다음");
};

describe("FundingDetailView", () => {
  afterEach(() => useFundingContributionStore.getState().reset());

  it("펀딩 제목과 '나도 보태볼까요?' 버튼을 보여준다", () => {
    render(<FundingDetailView fundingId="1" />);

    expect(screen.getByRole("heading", { level: 1, name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ })).toBeInTheDocument();
  });

  it("서프라이즈 개설자가 팝업의 '확인 대기' 행을 누르면 팝업을 닫지 않고 그 위에 입금 확인 시트가 열린다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" variant="surprise" />);

    await user.click(screen.getByRole("button", { name: /확인 대기 3건이 있어요/ }));
    await user.click(screen.getByRole("button", { name: /통장에 들어왔는지 확인해주세요/ }));

    const sheet = screen.getByRole("dialog", { name: "입금 확인" });
    expect(sheet).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "내 보탬" })).toBeInTheDocument();
    // top layer는 나중에 showModal한 다이얼로그가 위에 쌓인다
    expect(vi.mocked(HTMLDialogElement.prototype.showModal).mock.contexts.at(-1)).toBe(sheet);
  });

  it("기간이 마감되면 툴팁이 바뀌고 팝업에서 메세지 보태기만 누를 수 있다", () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2027-01-02T00:00:00") });
    try {
      render(<FundingDetailView fundingId="1" />);

      fireEvent.click(screen.getByRole("button", { name: /축하 메시지만 보낼 수 있어요!/ }));

      expect(screen.getByRole("button", { name: "보태기" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "메세지 보태기" })).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("메세지 보태기는 금액·송금 안내 없이 편지 → 비밀번호 → 완료 페이지로 이동하고 스토어에 편지·비밀번호만 담긴다", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2027-01-02T00:00:00") });
    try {
      const user = userEvent.setup();
      render(<FundingDetailView fundingId="1" />);
      await user.click(screen.getByRole("button", { name: /축하 메시지만 보낼 수 있어요!/ }));
      await user.click(screen.getByRole("button", { name: "메세지 보태기" }));

      const letter = await screen.findByRole("textbox", { name: "편지 내용" });
      letter.textContent = "생일 축하해!";
      fireEvent.input(letter);
      await user.type(screen.getByRole("textbox", { name: "친구에게 보여질 이름" }), "민수");
      await clickTopmost(user, "다음");

      await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
      expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "완료하기" }));

      expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
      const store = useFundingContributionStore.getState();
      expect(store.amount).toBe(0);
      expect(store.password).toBe("1234");
      expect(store.letter?.text).toBe("생일 축하해!");
    } finally {
      vi.useRealTimers();
    }
  });

  it("헤더에 공유·더보기 버튼이 있고 뒤로가기 버튼은 없다", () => {
    render(<FundingDetailView fundingId="1" />);

    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /뒤로/ })).not.toBeInTheDocument();
  });

  it("보탬을 수정해 저장하면 완료 안내를 띄우고, 확인을 눌러야 수정 화면이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    await user.click(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ }));
    await user.click(screen.getByRole("button", { name: /내 보탬 수정하기/ }));
    await user.type(await screen.findByRole("textbox", { name: "이름" }), "민지");
    await user.type(screen.getByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "확인" }));

    const letter = await screen.findByRole("textbox", { name: "편지 내용" });
    expect(letter).toHaveTextContent("올해도 같이 많이 웃자");
    letter.textContent = "고친 편지";
    fireEvent.input(letter);
    await user.click(screen.getByRole("button", { name: "이대로 저장하기" }));

    expect(await screen.findByRole("heading", { name: "보탬을 수정했어요" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "편지 내용" })).toBeInTheDocument();

    await clickTopmost(user, "확인");

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "편지 내용" })).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("heading", { name: "보탬을 수정했어요" })).not.toBeInTheDocument();
  });

  it("진행 카드와 사연(Message)을 함께 보여준다", () => {
    render(<FundingDetailView fundingId="1" />);

    expect(
      screen.getByRole("region", { name: "소니 WH-1000XM5 펀딩 진행 상황" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/올해 생일엔 출퇴근길에 쓸 노캔 헤드폰/, {
        selector: "p:not([aria-hidden])",
      }),
    ).toBeInTheDocument();
  });

  it("편지 시트에서 다음을 누르면 비밀번호 입력 시트가 나타난다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();

    await goToPasswordSheet(user);

    expect(await screen.findByLabelText("비밀번호 4자리")).toBeInTheDocument();
  });

  it("비밀번호 시트에서 이전을 누르면 편지 시트로 돌아온다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    await goToPasswordSheet(user);
    await screen.findByLabelText("비밀번호 4자리");

    await clickTopmost(user, "이전");

    await waitFor(() => expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "편지 내용" })).toHaveTextContent("생일 축하해!");
  });

  it("비밀번호를 입력하고 보태러 가기를 누르면 입력한 금액이 담긴 송금 안내 시트가 나타난다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    await goToPasswordSheet(user);

    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));

    const heading = await screen.findByRole("heading", { level: 1, name: /지유의 계좌로/ });
    expect(heading).toHaveTextContent("50,000원");
  });

  it("송금 안내 시트에서 완료하기를 누르면 완료 페이지로 replace 이동한다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    await goToPasswordSheet(user);
    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));
    await screen.findByRole("heading", { level: 1, name: /지유의 계좌로/ });

    await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
    await clickTopmost(user, "완료하기");

    expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
  });

  it("완료하기를 누르면 금액·편지·비밀번호가 스토어에 모두 담겨 있다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView fundingId="1" />);
    await goToPasswordSheet(user);
    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));
    await screen.findByRole("heading", { level: 1, name: /지유의 계좌로/ });

    await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
    await clickTopmost(user, "완료하기");

    expect(useFundingContributionStore.getState()).toMatchObject({
      amount: 50000,
      letter: { text: "생일 축하해!", name: "민수" },
      password: "1234",
    });
  });

  describe("보태기 플로우 나가기", () => {
    const openExitDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await clickTopmost(user, "닫기");
      return screen.findByRole("heading", { name: /보태기를 그만둘까요\?/ });
    };

    it("편지 시트의 X를 누르면 나가기 확인 Dialog가 뜨고, 아니오를 누르면 Dialog만 닫힌다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView fundingId="1" />);
      await goToPasswordSheet(user);
      await screen.findByLabelText("비밀번호 4자리");
      await clickTopmost(user, "이전");
      await screen.findByRole("textbox", { name: "편지 내용" });

      const title = await openExitDialog(user);
      expect(title).toHaveTextContent("지유에게");

      await user.click(screen.getByRole("button", { name: "아니오" }));

      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { name: /보태기를 그만둘까요\?/ }),
        ).not.toBeInTheDocument(),
      );
      expect(screen.getByRole("textbox", { name: "편지 내용" })).toHaveTextContent("생일 축하해!");
    });

    it("예를 누르면 열린 시트가 모두 닫히고, 다시 시작하면 입력이 비어 있다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView fundingId="1" />);
      await goToPasswordSheet(user);
      await screen.findByLabelText("비밀번호 4자리");

      await user.click(screen.getAllByRole("button", { name: "닫기", hidden: true }).at(-1)!);
      await user.click(await screen.findByRole("button", { name: "예" }));

      await waitFor(() => {
        expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox", { name: "편지 내용" })).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox", { name: "보탬 금액" })).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ }));
      await user.click(screen.getByRole("button", { name: "보태기" }));
      expect(await screen.findByRole("textbox", { name: "보탬 금액" })).toHaveValue("");
    });

    it("예를 누르면 스토어에 쌓인 입력값이 초기화된다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView fundingId="1" />);
      await goToPasswordSheet(user);
      await screen.findByLabelText("비밀번호 4자리");
      expect(useFundingContributionStore.getState().amount).toBe(50000);

      await user.click(screen.getAllByRole("button", { name: "닫기", hidden: true }).at(-1)!);
      await user.click(await screen.findByRole("button", { name: "예" }));

      expect(useFundingContributionStore.getState()).toMatchObject({
        amount: 0,
        letter: null,
        password: "",
      });
    });
  });
});
