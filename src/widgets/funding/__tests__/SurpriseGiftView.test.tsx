import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseGiftView from "@/widgets/funding/SurpriseGiftView";

vi.mock("@/widgets/funding/SurpriseGiftWallet", () => ({
  default: () => <div data-testid="wallet" />,
}));
vi.mock("@/widgets/funding/SurpriseGiftCoupangGuide", () => ({
  default: ({ productName }: { productName: string }) => (
    <div data-testid="coupang-guide">{productName}</div>
  ),
}));

const basePreparation = {
  recipientName: "지유" as string | null,
  participantCount: 4,
  confirmedAmount: 1250000,
  targetReached: true,
  revealAt: "2026-10-13T00:00:00" as string | null,
  productImageUrl: "https://example.com/gift.png",
  productName: "무선 헤드폰",
  productSellerName: "보탬샵" as string | null,
};

const renderView = (
  preparation: Partial<typeof basePreparation> = {},
  props: Partial<React.ComponentProps<typeof SurpriseGiftView>> = {},
) => {
  const handlers = {
    onClose: vi.fn(),
    onBuy: vi.fn(),
    onPrepare: vi.fn(),
    onTransfer: vi.fn(),
  };
  render(
    <SurpriseGiftView
      preparation={{ ...basePreparation, ...preparation }}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe("SurpriseGiftView", () => {
  it("목표를 달성했으면 모인 인원·금액 제목과 쿠팡 구매 버튼을 보이고 송금 버튼은 없다", () => {
    renderView();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "친구 4명이 1,250,000원을 모았어요",
    );
    expect(screen.getByRole("button", { name: "쿠팡에 선물 사러가기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "선물 준비하기" })).toBeInTheDocument();
    expect(screen.getByText("구매하셨다면?")).toBeInTheDocument();
    expect(screen.getByTestId("coupang-guide")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /송금하기/ })).not.toBeInTheDocument();
  });

  it("목표 미달이면 송금 안내 문구와 '{이름}에게 송금하기' 버튼을 보이고 쿠팡 안내는 없다", () => {
    renderView({ targetReached: false });

    expect(screen.getByText("롤링페이퍼와 함께 모인 금액을 송금해 볼까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지유에게 송금하기" })).toBeInTheDocument();
    expect(screen.getByTestId("wallet")).toBeInTheDocument();
    expect(screen.queryByTestId("coupang-guide")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "쿠팡에 선물 사러가기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "선물 준비하기" })).not.toBeInTheDocument();
  });

  it("revealAt이 있으면 공개 시각을 안내한다", () => {
    renderView({ revealAt: "2026-10-13T09:00:00" });

    expect(
      screen.getByText("이제 선물을 준비해요. 10월 13일 9시에 지유에게 공개돼요"),
    ).toBeInTheDocument();
  });

  it("revealAt이 null이면 공개 시각 없이 '이제 선물을 준비해요'만 보인다", () => {
    renderView({ revealAt: null });

    expect(screen.getByText("이제 선물을 준비해요")).toBeInTheDocument();
  });

  it("recipientName이 빈 문자열이면 '친구'로 대신 부른다", () => {
    renderView({ recipientName: "", targetReached: false });

    expect(screen.getByRole("button", { name: "친구에게 송금하기" })).toBeInTheDocument();
  });

  it("recipientName이 null이어도 '친구'로 대신 부른다", () => {
    renderView({ recipientName: null, revealAt: "2026-10-13T00:00:00" });

    expect(screen.getByText(/친구에게 공개돼요/)).toBeInTheDocument();
  });

  it("모인 금액이 0원이면 '0원'으로 표시한다", () => {
    renderView({ confirmedAmount: 0, participantCount: 0 });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "친구 0명이 0원을 모았어요",
    );
  });

  it("쿠팡에 선물 사러가기를 누르면 onBuy를 호출한다", async () => {
    const { onBuy } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "쿠팡에 선물 사러가기" }));

    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it("송금하기를 누르면 onTransfer를 호출한다", async () => {
    const { onTransfer } = renderView({ targetReached: false });

    await userEvent.click(screen.getByRole("button", { name: "지유에게 송금하기" }));

    expect(onTransfer).toHaveBeenCalledTimes(1);
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    const { onClose } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("선물 준비하기를 누르면 onPrepare를 호출한다", async () => {
    const { onPrepare } = renderView();

    await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

    expect(onPrepare).toHaveBeenCalledTimes(1);
  });

  it("preparePending이면 선물 준비하기 버튼이 로딩 상태라 눌러도 onPrepare를 호출하지 않는다", async () => {
    const { onPrepare } = renderView({}, { preparePending: true });
    const button = screen.getByRole("button", { name: "선물 준비하기" });

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(onPrepare).not.toHaveBeenCalled();
  });
});
