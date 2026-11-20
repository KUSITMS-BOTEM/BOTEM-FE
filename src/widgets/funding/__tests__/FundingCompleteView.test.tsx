import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";

import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import FundingCompleteView from "@/widgets/funding/FundingCompleteView";

const replaceMock = vi.fn();
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

vi.mock("@/utils/saveNodeAsImage", () => ({ saveNodeAsImage: vi.fn() }));

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

const FUNDING = {
  fundingId: 7,
  hostName: "민재",
  giverName: "민지",
  contributionOrder: 3,
  risePercent: 20,
  productName: "소니 WH-1000XM5",
  productImageUrl: "/product.png",
  deadline: "2026-12-31",
  percent: 60,
  targetAmount: 123456789,
};

const renderView = (props: { shareKey?: string; isMessageOnly?: boolean } = {}) =>
  render(
    <FundingCompleteView
      shareKey={props.shareKey ?? "1"}
      funding={FUNDING}
      isMessageOnly={props.isMessageOnly ?? false}
    />,
  );

describe("FundingCompleteView 올랐어요 뱃지", () => {
  it("금액을 보탠 경우에는 올랐어요 뱃지를 보여준다", () => {
    renderView();

    expect(screen.getByText("올랐어요")).toBeInTheDocument();
  });

  it("메시지만 보탠 경우에는 올랐어요 뱃지를 숨긴다", () => {
    renderView({ isMessageOnly: true });

    expect(screen.queryByText("올랐어요")).not.toBeInTheDocument();
  });
});

describe("FundingCompleteView", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  describe("모션 타임라인", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("처음에는 진행률 장면 제목을 보여주고 공유하기 버튼은 없다", () => {
      renderView({ shareKey: "1" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "민재에게 보탬이 되었어요",
      );
      expect(screen.queryByRole("button", SHARE_BUTTON)).not.toBeInTheDocument();
    });

    it("2.3초 뒤에는 3번째로 보탬 제목으로 바뀌지만 공유하기 버튼은 아직 없다", () => {
      renderView({ shareKey: "1" });

      act(() => {
        vi.advanceTimersByTime(2300);
      });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3번째로 보탬!");
      expect(screen.queryByRole("button", SHARE_BUTTON)).not.toBeInTheDocument();
    });

    it("4.6초 뒤에 공유하기 버튼이 나타난다", () => {
      renderView({ shareKey: "1" });

      act(() => {
        vi.advanceTimersByTime(4600);
      });

      expect(screen.getByRole("button", SHARE_BUTTON)).toBeInTheDocument();
    });
  });

  describe("모션 감소 설정", () => {
    beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(true));

    it("처음부터 자랑 장면 제목과 공유하기 버튼을 보여준다", () => {
      renderView({ shareKey: "1" });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3번째로 보탬!");
      expect(screen.getByRole("button", SHARE_BUTTON)).toBeInTheDocument();
    });

    it("컨페티를 그리지 않는다", () => {
      renderView({ shareKey: "1" });

      expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    });
  });

  it("모션 감소가 아니면 컨페티를 그린다", () => {
    renderView({ shareKey: "1" });

    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("닫기 버튼을 누르면 push가 아니라 replace로 공유 페이지에 이동한다", async () => {
    renderView({ shareKey: "7" });

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/share/7"));
    expect(pushMock).not.toHaveBeenCalled();
  });

  describe("공유하기", () => {
    beforeEach(() => vi.mocked(useReducedMotion).mockReturnValue(true));

    it("누르면 자랑 카드를 이미지로 저장·공유한다", async () => {
      renderView({ shareKey: "7" });

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      await vi.waitFor(() =>
        expect(saveNodeAsImage).toHaveBeenCalledWith(expect.any(HTMLElement), "민재에게-보탬.png"),
      );
    });

    it("이미지 저장에 실패하면 안내 토스트를 보여준다", async () => {
      vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
      renderView({ shareKey: "7" });

      fireEvent.click(screen.getByRole("button", SHARE_BUTTON));

      expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
    });
  });
});
