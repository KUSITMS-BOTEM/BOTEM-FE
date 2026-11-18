import { act, fireEvent, render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";

import { useFundingContributionStore } from "@/store/fundingContributionStore";
import FundingCompleteContainer from "@/widgets/funding/FundingCompleteContainer";

const replaceMock = vi.fn();
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

// exit 애니메이션을 기다리지 않고 장면 전환 결과만 검증하도록 AnimatePresence를 단순 대체한다
vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("@/widgets/funding/FundingCompleteConfetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

const SHARE_BUTTON = { name: "공유하기" };

describe("FundingCompleteContainer 입력값 정리", () => {
  it("완료 페이지를 떠나면 보태기 플로우 입력값이 초기화된다", () => {
    useFundingContributionStore.getState().setPassword("1234");
    const { unmount } = render(<FundingCompleteContainer fundingId="1" />);

    unmount();

    expect(useFundingContributionStore.getState().password).toBe("");
  });
});

describe("FundingCompleteContainer 올랐어요 뱃지", () => {
  afterEach(() => useFundingContributionStore.getState().reset());

  it("금액을 보탠 경우에는 올랐어요 뱃지를 보여준다", () => {
    useFundingContributionStore.getState().setAmount(50000);
    render(<FundingCompleteContainer fundingId="1" />);

    expect(screen.getByText("올랐어요")).toBeInTheDocument();
  });

  it("메시지만 보탠 경우(금액 0)에는 올랐어요 뱃지를 숨긴다", () => {
    render(<FundingCompleteContainer fundingId="1" />);

    expect(screen.queryByText("올랐어요")).not.toBeInTheDocument();
  });
});

describe("FundingCompleteContainer", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  describe("모션 타임라인", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("처음에는 진행률 장면 제목을 보여주고 공유하기 버튼은 없다", () => {
      render(<FundingCompleteContainer fundingId="1" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "지유에게 보탬이 되었어요",
      );
      expect(screen.queryByRole("button", SHARE_BUTTON)).not.toBeInTheDocument();
    });

    it("2.3초 뒤에는 3번째로 보탬 제목으로 바뀌지만 공유하기 버튼은 아직 없다", () => {
      render(<FundingCompleteContainer fundingId="1" />);

      act(() => {
        vi.advanceTimersByTime(2300);
      });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3번째로 보탬!");
      expect(screen.queryByRole("button", SHARE_BUTTON)).not.toBeInTheDocument();
    });

    it("4.6초 뒤에 공유하기 버튼이 나타난다", () => {
      render(<FundingCompleteContainer fundingId="1" />);

      act(() => {
        vi.advanceTimersByTime(4600);
      });

      expect(screen.getByRole("button", SHARE_BUTTON)).toBeInTheDocument();
    });
  });

  describe("모션 감소 설정", () => {
    beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(true));

    it("처음부터 자랑 장면 제목과 공유하기 버튼을 보여준다", () => {
      render(<FundingCompleteContainer fundingId="1" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3번째로 보탬!");
      expect(screen.getByRole("button", SHARE_BUTTON)).toBeInTheDocument();
    });

    it("컨페티를 그리지 않는다", () => {
      render(<FundingCompleteContainer fundingId="1" />);

      expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    });
  });

  it("모션 감소가 아니면 컨페티를 그린다", () => {
    render(<FundingCompleteContainer fundingId="1" />);

    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("닫기 버튼을 누르면 push가 아니라 replace로 공유 페이지에 이동한다", () => {
    render(<FundingCompleteContainer fundingId="7" />);

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replaceMock).toHaveBeenCalledWith("/share/7");
    expect(pushMock).not.toHaveBeenCalled();
  });

  describe("공유하기", () => {
    const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const define = (key: "share" | "clipboard", value: unknown) =>
      Object.defineProperty(navigator, key, { value, configurable: true, writable: true });

    beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(true));
    afterEach(() => {
      for (const [key, original] of [
        ["share", originalShare],
        ["clipboard", originalClipboard],
      ] as const) {
        if (original) Object.defineProperty(navigator, key, original);
        else delete (navigator as unknown as Record<string, unknown>)[key];
      }
    });

    it("navigator.share가 있으면 공유 링크를 담아 호출한다", async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      define("share", share);
      render(<FundingCompleteContainer fundingId="7" />);

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      await vi.waitFor(() =>
        expect(share).toHaveBeenCalledWith(
          expect.objectContaining({ url: `${window.location.origin}/share/7` }),
        ),
      );
    });

    it("사용자가 공유창을 닫으면 링크 복사도 토스트도 없다", async () => {
      const share = vi.fn().mockRejectedValue(new DOMException("취소", "AbortError"));
      const writeText = vi.fn();
      define("share", share);
      define("clipboard", { writeText });
      render(<FundingCompleteContainer fundingId="7" />);

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      await vi.waitFor(() => expect(share).toHaveBeenCalled());
      expect(writeText).not.toHaveBeenCalled();
      expect(screen.queryByText(/링크를 복사/)).not.toBeInTheDocument();
    });

    it("navigator.share가 없으면 링크를 복사하고 복사 성공 토스트를 보여준다", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      define("share", undefined);
      define("clipboard", { writeText });
      render(<FundingCompleteContainer fundingId="7" />);

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      expect(await screen.findByText("링크를 복사했어요")).toBeInTheDocument();
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/share/7`);
    });

    it("링크 복사에 실패하면 실패 토스트를 보여준다", async () => {
      define("share", undefined);
      define("clipboard", { writeText: vi.fn().mockRejectedValue(new Error("거부")) });
      render(<FundingCompleteContainer fundingId="7" />);

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      expect(await screen.findByText("링크를 복사하지 못했어요")).toBeInTheDocument();
    });
  });
});
