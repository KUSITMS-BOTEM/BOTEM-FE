import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

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

describe("FundingShareContainer", () => {
  it("펀딩 제목과 '나도 보태볼까요?' 버튼을 보여준다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(screen.getByRole("heading", { level: 1, name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /나도 지유님께 보태볼까요\?/ })).toBeInTheDocument();
  });

  it("헤더에 공유·더보기 버튼이 있고 뒤로가기 버튼은 없다", () => {
    render(<FundingShareContainer fundingId="1" />);

    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /뒤로/ })).not.toBeInTheDocument();
  });

  it("진행 카드와 사연(Message)을 함께 보여준다", () => {
    render(<FundingShareContainer fundingId="1" />);

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
    render(<FundingShareContainer fundingId="1" />);
    expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();

    await goToPasswordSheet(user);

    expect(await screen.findByLabelText("비밀번호 4자리")).toBeInTheDocument();
  });

  it("비밀번호 시트에서 이전을 누르면 편지 시트로 돌아온다", async () => {
    const user = userEvent.setup();
    render(<FundingShareContainer fundingId="1" />);
    await goToPasswordSheet(user);
    await screen.findByLabelText("비밀번호 4자리");

    await clickTopmost(user, "이전");

    await waitFor(() => expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "편지 내용" })).toHaveTextContent("생일 축하해!");
  });

  it("비밀번호를 입력하고 보태러 가기를 누르면 입력한 금액이 담긴 송금 안내 시트가 나타난다", async () => {
    const user = userEvent.setup();
    render(<FundingShareContainer fundingId="1" />);
    await goToPasswordSheet(user);

    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));

    const heading = await screen.findByRole("heading", { level: 1, name: /지유의 계좌로/ });
    expect(heading).toHaveTextContent("50,000원");
  });

  describe("보태기 플로우 나가기", () => {
    const openExitDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await clickTopmost(user, "닫기");
      return screen.findByRole("heading", { name: /보태기를 그만둘까요\?/ });
    };

    it("편지 시트의 X를 누르면 나가기 확인 Dialog가 뜨고, 아니오를 누르면 Dialog만 닫힌다", async () => {
      const user = userEvent.setup();
      render(<FundingShareContainer fundingId="1" />);
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
      render(<FundingShareContainer fundingId="1" />);
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
  });
});
