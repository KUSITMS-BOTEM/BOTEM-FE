import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { SurpriseMessage } from "@/types/funding/surprise";
import SurpriseResultView from "@/widgets/funding/SurpriseResultView";

vi.mock("@/widgets/funding/FundingResultCelebration", () => ({
  default: ({
    productImage,
    contributors,
    reduceMotion,
  }: {
    productImage?: string;
    contributors: unknown[];
    reduceMotion: boolean;
  }) => (
    <div
      data-testid="celebration"
      data-image={productImage ?? ""}
      data-count={contributors.length}
      data-reduce={String(reduceMotion)}
    />
  ),
}));

const baseSurprise = {
  organizerName: "민준",
  productName: "무선 헤드폰",
  productImageUrl: "https://example.com/gift.png",
  productPrice: 300000,
  productChanged: false,
  giftChosen: false,
  confirmedAmount: 300000,
  confirmedPercentage: 100,
  messages: [] as SurpriseMessage[],
};

const renderView = (
  surprise: Partial<typeof baseSurprise> = {},
  props: Partial<React.ComponentProps<typeof SurpriseResultView>> = {},
) => {
  const handlers = { onClose: vi.fn(), onBuy: vi.fn(), onChangeGift: vi.fn() };
  render(
    <SurpriseResultView
      surprise={{ ...baseSurprise, ...surprise }}
      reduceMotion={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe("SurpriseResultView", () => {
  it("달성률이 100% 이상이면 '모두 모였어요' 제목과 쿠팡 구매 버튼만 보인다", () => {
    renderView({ confirmedAmount: 330000, confirmedPercentage: 110 });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "330,000원이 모두 모였어요",
    );
    expect(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다른 선물 고르기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "차액으로 구매" })).not.toBeInTheDocument();
  });

  it("달성률이 100% 이상이면 준비한 사람과 상품 가격·상품명을 보여준다", () => {
    renderView();

    expect(screen.getByText("300,000원")).toBeInTheDocument();
    expect(screen.getByText("민준님이 준비한 선물")).toBeInTheDocument();
    expect(screen.getByText("무선 헤드폰")).toBeInTheDocument();
  });

  it("달성률이 100% 미만이면 상품 가격 기준 차액과 다른 선물 고르기·차액으로 구매 버튼을 보인다", () => {
    renderView({ confirmedAmount: 150000, confirmedPercentage: 50, productPrice: 200000 });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("150,000원이 모였어요");
    expect(screen.getByText(/차액 50,000원만/)).toBeInTheDocument();
    expect(screen.getByText("기존 선물")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다른 선물 고르기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "차액으로 구매" })).toBeInTheDocument();
  });

  it("달성률이 100% 미만이어도 이미 선물을 정했으면 다른 선물 고르기 없이 차액으로 구매만 보인다", () => {
    renderView({ confirmedPercentage: 50, giftChosen: true });

    expect(screen.queryByRole("button", { name: "다른 선물 고르기" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "차액으로 구매" })).toBeInTheDocument();
  });

  it("다른 위시로 바꿨으면 '변경한 선물'로 표시한다", () => {
    renderView({ confirmedPercentage: 50, productChanged: true });

    expect(screen.getByText("변경한 선물")).toBeInTheDocument();
  });

  it("차액으로 구매를 누르면 onBuy, 다른 선물 고르기를 누르면 onChangeGift를 호출한다", async () => {
    const { onBuy, onChangeGift } = renderView({ confirmedPercentage: 50 });

    await userEvent.click(screen.getByRole("button", { name: "차액으로 구매" }));
    await userEvent.click(screen.getByRole("button", { name: "다른 선물 고르기" }));

    expect(onBuy).toHaveBeenCalledTimes(1);
    expect(onChangeGift).toHaveBeenCalledTimes(1);
  });

  it("buyPending이면 구매 버튼이 로딩 상태라 눌러도 onBuy를 호출하지 않는다", async () => {
    const { onBuy } = renderView({}, { buyPending: true });
    const button = screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" });

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(onBuy).not.toHaveBeenCalled();
  });

  it("상품 이미지 URL이 올바르지 않으면 이미지 없이 축하 연출에 넘긴다", () => {
    renderView({ productImageUrl: "not-a-url" });

    expect(screen.getByTestId("celebration")).toHaveAttribute("data-image", "");
  });

  it("메시지 개수만큼 참여자를 축하 연출에 넘긴다", () => {
    renderView({
      messages: [
        {
          messageId: 1,
          participantName: "서연",
          participantProfileImageUrl: null,
          content: "축하해",
          paperTemplateCode: "A",
          decorationCode: null,
          photoUrl: null,
          voiceUrl: null,
          voiceDurationSeconds: null,
          voiceTranscript: null,
        },
      ],
    });

    expect(screen.getByTestId("celebration")).toHaveAttribute("data-count", "1");
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    const { onClose } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
