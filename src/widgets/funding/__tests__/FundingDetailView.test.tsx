import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { FUNDING_DETAIL as DETAIL } from "@/widgets/funding/__tests__/fixtures/fundingDetail";
import FundingDetailView from "@/widgets/funding/FundingDetailView";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));

// 로그인 뮤테이션은 QueryClient가 필요하므로 대체하고, 카카오 로그인 요청은 호출 인자만 확인한다
const kakaoLoginMock = vi.fn();
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));
vi.mock("@/utils/auth/handleKakaoLoginClick", () => ({
  handleKakaoLoginClick: (...args: unknown[]) => kakaoLoginMock(...args),
}));

vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));

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

type User = ReturnType<typeof userEvent.setup>;

// 앞 단계 시트는 열어 둔 채 위에 쌓이므로 같은 이름의 버튼은 마지막(가장 위) 것을 누른다
const clickTopmost = async (user: User, name: string) =>
  user.click(screen.getAllByRole("button", { name }).at(-1)!);

// 비회원 '보태러가기': 회원/비회원 Dialog에서 아니오를 고르면 하단이 '메시지 보태기'/'보태기'로 바뀐다
const enterGuestContributeMode = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "보태러 가기" }));
  await user.click(screen.getByRole("button", { name: "아니오" }));
};

// 비회원 '내 보탬 확인': 아니오 → 이름·비밀번호 입력 → 확인
const confirmGuestMyBotem = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "내 보탬 확인" }));
  await user.click(screen.getByRole("button", { name: "아니오" }));
  await user.type(await screen.findByRole("textbox", { name: "이름" }), "민지");
  await user.type(screen.getByLabelText("비밀번호 4자리"), "1234");
  await user.click(screen.getByRole("button", { name: "확인" }));
};

const writeLetter = async (user: User, { withName }: { withName: boolean }) => {
  const letter = await screen.findByRole("textbox", { name: "편지 내용" });
  // plaintext-only는 user-event가 편집 가능으로 보지 않아 내용을 넣고 input 이벤트를 직접 발생시킨다
  letter.textContent = "생일 축하해!";
  fireEvent.input(letter);
  if (withName) {
    await user.type(screen.getByRole("textbox", { name: "친구에게 보여질 이름" }), "민수");
  }
  await clickTopmost(user, "다음");
};

// 금액 입력 → 편지 작성까지 진행해 비밀번호 시트 직전 단계로 간다
const goToPasswordSheet = async (user: User) => {
  await enterGuestContributeMode(user);
  await user.click(screen.getByRole("button", { name: "보태기" }));
  await user.type(await screen.findByRole("textbox", { name: "보탬 금액" }), "50000");
  await clickTopmost(user, "다음");
  await writeLetter(user, { withName: true });
};

describe("FundingDetailView", () => {
  afterEach(() => {
    useFundingContributionStore.getState().reset();
    useGuestBotemStore.getState().reset();
    replaceMock.mockClear();
    kakaoLoginMock.mockClear();
  });

  it("펀딩 제목과 하단 '내 보탬 확인'·'보태러가기' 버튼을 보여주고 프로필 묶음 버튼은 없다", () => {
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);

    expect(screen.getByRole("heading", { level: 1, name: "민재의 생일" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "내 보탬 확인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "보태러 가기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /나도 민재님께 보태볼까요\?/ })).toBeNull();
  });

  it("서프라이즈 개설자가 팝업의 '확인 대기' 행을 누르면 팝업을 닫지 않고 그 위에 입금 확인 시트가 열린다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" variant="surprise" />);

    await user.click(screen.getByRole("button", { name: /확인 대기 3건이 있어요/ }));
    await user.click(screen.getByRole("button", { name: /통장에 들어왔는지 확인해주세요/ }));

    const sheet = screen.getByRole("dialog", { name: "입금 확인" });
    expect(sheet).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "내 보탬" })).toBeInTheDocument();
    // top layer는 나중에 showModal한 다이얼로그가 위에 쌓인다
    expect(vi.mocked(HTMLDialogElement.prototype.showModal).mock.contexts.at(-1)).toBe(sheet);
  });

  it("서프라이즈 개설자와 펀딩 주인 화면에는 하단 CTA 버튼이 없다", () => {
    const { unmount } = render(
      <FundingDetailView detail={DETAIL} fundingId="1" variant="surprise" />,
    );
    expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
    unmount();

    render(<FundingDetailView detail={DETAIL} fundingId="1" variant="owner" />);
    expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
  });

  describe("회원/비회원 구분 Dialog", () => {
    it.each(["내 보탬 확인", "보태러 가기"])("%s를 누르면 구분 Dialog를 연다", async name => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);

      await user.click(screen.getByRole("button", { name }));

      expect(
        await screen.findByRole("heading", { name: "이미 보탬 회원이신가요?" }),
      ).toBeInTheDocument();
    });

    it("'내 보탬 확인'에서 예를 누르면 내 보탬 확인 복귀 경로로 카카오 로그인을 요청한다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await user.click(screen.getByRole("button", { name: "내 보탬 확인" }));

      await user.click(screen.getByRole("button", { name: "예" }));

      expect(kakaoLoginMock).toHaveBeenCalledWith(expect.anything(), "/share/1?member=myBotem");
    });

    it("'보태러가기'에서 예를 누르면 보태러가기 복귀 경로로 카카오 로그인을 요청한다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await user.click(screen.getByRole("button", { name: "보태러 가기" }));

      await user.click(screen.getByRole("button", { name: "예" }));

      expect(kakaoLoginMock).toHaveBeenCalledWith(expect.anything(), "/share/1?member=contribute");
    });
  });

  describe("비회원 내 보탬 확인", () => {
    it("이름·비밀번호를 입력하면 하단에 '내 보탬 확인'만 남고 시트가 자동으로 열리며 스토어에 담긴다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      expect(screen.queryByRole("dialog", { name: "내 보탬 확인" })).not.toBeInTheDocument();

      await confirmGuestMyBotem(user);

      expect(await screen.findByRole("dialog", { name: "내 보탬 확인" })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "내 보탬 확인" })).toHaveLength(1);
      expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
      expect(useGuestBotemStore.getState()).toMatchObject({
        fundingId: "1",
        name: "민지",
        password: "1234",
      });
    });

    it("이미 확인한 뒤에는 남은 '내 보탬 확인' 버튼으로 시트를 다시 연다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await confirmGuestMyBotem(user);
      await user.click(await screen.findByRole("button", { name: "닫기" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "내 보탬 확인" })).not.toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "내 보탬 확인" }));

      expect(await screen.findByRole("dialog", { name: "내 보탬 확인" })).toBeInTheDocument();
    });

    it("다른 펀딩에서 확인한 값은 이 펀딩의 확인 상태로 보지 않는다", () => {
      useGuestBotemStore.getState().setIdentity("other", "민지", "1234");

      render(<FundingDetailView detail={DETAIL} fundingId="1" />);

      expect(screen.getByRole("button", { name: "보태러 가기" })).toBeInTheDocument();
    });

    it("시트에서 내 보탬이 맨 위에 '내 보탬' 라벨과 미확인 안내와 함께 보인다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await confirmGuestMyBotem(user);

      const sheet = await screen.findByRole("dialog", { name: "내 보탬 확인" });

      expect(sheet).toHaveTextContent("내 보탬서연");
      expect(sheet).toHaveTextContent("아직 확인하지 않았어요");
      expect(screen.queryByRole("button", { name: "메세지 보태기" })).not.toBeInTheDocument();
    });

    it("보탬을 수정해 저장하면 완료 안내를 띄우고, 확인을 눌러야 수정 화면이 닫힌다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await confirmGuestMyBotem(user);
      await user.click(await screen.findByRole("button", { name: /내 보탬 수정하기/ }));
      // 이미 이름·비밀번호를 입력했으므로 다시 묻지 않고 바로 편지 수정으로 간다
      expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();

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
  });

  it("보태기를 마치면 돌아왔을 때 하단이 '내 보탬 확인'이 되도록 본인 확인을 기록한다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="contribute" />);
    await user.click(screen.getByRole("button", { name: "메시지 보태기" }));
    await writeLetter(user, { withName: false });

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/share/1/complete"));
    expect(useGuestBotemStore.getState().fundingId).toBe("1");
  });

  it("로그인 쿠키가 있는 회원은 쿼리가 없어도(새로고침) 하단에 '내 보탬 확인'만 보이고 시트는 열리지 않는다", () => {
    render(<FundingDetailView detail={DETAIL} fundingId="1" isLoggedIn />);

    expect(screen.getByRole("button", { name: "내 보탬 확인" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "내 보탬 확인" })).not.toBeInTheDocument();
  });

  it("보태러가기로 돌아온 회원은 로그인 쿠키가 있어도 '메시지 보태기'/'보태기'를 보여준다", () => {
    render(
      <FundingDetailView detail={DETAIL} fundingId="1" memberIntent="contribute" isLoggedIn />,
    );

    expect(screen.getByRole("button", { name: "보태기" })).toBeInTheDocument();
  });

  it("내 보탬 확인으로 돌아오면 주소에서 member 쿼리를 지워 새로고침해도 시트가 다시 열리지 않는다", () => {
    window.history.replaceState(null, "", "/share/1?member=myBotem");
    render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="myBotem" isLoggedIn />);

    expect(window.location.search).toBe("");
  });

  describe("비회원 보태러가기", () => {
    it("아니오를 누르면 하단이 '메시지 보태기'/'보태기'로 바뀌고 시트는 자동으로 열리지 않는다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);

      await enterGuestContributeMode(user);

      expect(screen.getByRole("button", { name: "메시지 보태기" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "보태기" })).toBeEnabled();
      expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog", { name: "내 보탬 확인" })).not.toBeInTheDocument();
    });

    it("기간이 마감되면 '보태기'는 비활성이고 '메시지 보태기'만 누를 수 있다", async () => {
      vi.useFakeTimers({ toFake: ["Date"], now: new Date("2027-01-02T00:00:00") });
      try {
        const user = userEvent.setup();
        render(<FundingDetailView detail={DETAIL} fundingId="1" />);

        await enterGuestContributeMode(user);

        expect(screen.getByRole("button", { name: "보태기" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "메시지 보태기" })).toBeEnabled();
      } finally {
        vi.useRealTimers();
      }
    });

    it("메시지 보태기는 금액·송금 안내 없이 편지 → 비밀번호 → 완료 페이지로 이동하고 스토어에 편지·비밀번호만 담긴다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await enterGuestContributeMode(user);
      await user.click(screen.getByRole("button", { name: "메시지 보태기" }));
      await writeLetter(user, { withName: true });

      await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
      expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "완료하기" }));

      expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
      const store = useFundingContributionStore.getState();
      expect(store.amount).toBe(0);
      expect(store.password).toBe("1234");
      expect(store.letter?.text).toBe("생일 축하해!");
    });
  });

  describe("회원 (공유 화면에서 로그인해 돌아온 경우)", () => {
    it("내 보탬 확인으로 돌아오면 하단에 '내 보탬 확인'만 남기고 시트를 자동으로 연다", async () => {
      render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="myBotem" />);

      expect(await screen.findByRole("dialog", { name: "내 보탬 확인" })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "내 보탬 확인" })).toHaveLength(1);
      expect(screen.queryByRole("button", { name: "보태러 가기" })).not.toBeInTheDocument();
    });

    it("보태러가기로 돌아오면 '메시지 보태기'/'보태기'를 보여주고 시트는 자동으로 열지 않는다", () => {
      render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="contribute" />);

      expect(screen.getByRole("button", { name: "메시지 보태기" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "보태기" })).toBeInTheDocument();
      expect(screen.queryByRole("dialog", { name: "내 보탬 확인" })).not.toBeInTheDocument();
    });

    it("보태기는 이름·비밀번호 없이 금액 → 편지 → 송금 안내 → 완료 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="contribute" />);
      await user.click(screen.getByRole("button", { name: "보태기" }));
      await user.type(await screen.findByRole("textbox", { name: "보탬 금액" }), "50000");
      await clickTopmost(user, "다음");

      await screen.findByRole("textbox", { name: "편지 내용" });
      expect(screen.queryByRole("textbox", { name: "친구에게 보여질 이름" })).toBeNull();
      await writeLetter(user, { withName: false });

      const heading = await screen.findByRole("heading", { level: 1, name: /민재의 계좌로/ });
      expect(heading).toHaveTextContent("50,000원");
      expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();

      await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
      await clickTopmost(user, "완료하기");

      expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
    });

    it("메시지 보태기는 편지 다음에 비밀번호 없이 바로 완료 페이지로 이동한다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" memberIntent="contribute" />);
      await user.click(screen.getByRole("button", { name: "메시지 보태기" }));

      await writeLetter(user, { withName: false });

      expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
      expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();
    });
  });

  it("헤더에 공유·더보기 버튼이 있고 뒤로가기 버튼은 없다", () => {
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);

    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /뒤로/ })).not.toBeInTheDocument();
  });

  it("진행 카드와 사연(Message)을 함께 보여준다", () => {
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);

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
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);
    expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();

    await goToPasswordSheet(user);

    expect(await screen.findByLabelText("비밀번호 4자리")).toBeInTheDocument();
  });

  it("비밀번호 시트에서 이전을 누르면 편지 시트로 돌아온다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);
    await goToPasswordSheet(user);
    await screen.findByLabelText("비밀번호 4자리");

    await clickTopmost(user, "이전");

    await waitFor(() => expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "편지 내용" })).toHaveTextContent("생일 축하해!");
  });

  it("비밀번호를 입력하고 보태러 가기를 누르면 입력한 금액이 담긴 송금 안내 시트가 나타난다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);
    await goToPasswordSheet(user);

    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));

    const heading = await screen.findByRole("heading", { level: 1, name: /민재의 계좌로/ });
    expect(heading).toHaveTextContent("50,000원");
  });

  it("송금 안내 시트에서 완료하기를 누르면 완료 페이지로 replace 이동한다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);
    await goToPasswordSheet(user);
    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));
    await screen.findByRole("heading", { level: 1, name: /민재의 계좌로/ });

    await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
    await clickTopmost(user, "완료하기");

    expect(replaceMock).toHaveBeenCalledWith("/share/1/complete");
  });

  it("완료하기를 누르면 금액·편지·비밀번호가 스토어에 모두 담겨 있다", async () => {
    const user = userEvent.setup();
    render(<FundingDetailView detail={DETAIL} fundingId="1" />);
    await goToPasswordSheet(user);
    await user.type(await screen.findByLabelText("비밀번호 4자리"), "1234");
    await user.click(screen.getByRole("button", { name: "보태러 가기" }));
    await screen.findByRole("heading", { level: 1, name: /민재의 계좌로/ });

    await user.click(screen.getByRole("checkbox", { name: "송금했어요" }));
    await clickTopmost(user, "완료하기");

    expect(useFundingContributionStore.getState()).toMatchObject({
      amount: 50000,
      letter: { text: "생일 축하해!", name: "민수" },
      password: "1234",
    });
  });

  describe("보태기 플로우 나가기", () => {
    const openExitDialog = async (user: User) => {
      await clickTopmost(user, "닫기");
      return screen.findByRole("heading", { name: /보태기를 그만둘까요\?/ });
    };

    it("편지 시트의 X를 누르면 나가기 확인 Dialog가 뜨고, 아니오를 누르면 Dialog만 닫힌다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await goToPasswordSheet(user);
      await screen.findByLabelText("비밀번호 4자리");
      await clickTopmost(user, "이전");
      await screen.findByRole("textbox", { name: "편지 내용" });

      const title = await openExitDialog(user);
      expect(title).toHaveTextContent("민재에게");

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
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
      await goToPasswordSheet(user);
      await screen.findByLabelText("비밀번호 4자리");

      await user.click(screen.getAllByRole("button", { name: "닫기", hidden: true }).at(-1)!);
      await user.click(await screen.findByRole("button", { name: "예" }));

      await waitFor(() => {
        expect(screen.queryByLabelText("비밀번호 4자리")).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox", { name: "편지 내용" })).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox", { name: "보탬 금액" })).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "보태기" }));
      expect(await screen.findByRole("textbox", { name: "보탬 금액" })).toHaveValue("");
    });

    it("예를 누르면 스토어에 쌓인 입력값이 초기화된다", async () => {
      const user = userEvent.setup();
      render(<FundingDetailView detail={DETAIL} fundingId="1" />);
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
