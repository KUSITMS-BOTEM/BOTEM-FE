import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingResultView, { type FundingResult } from "@/widgets/funding/FundingResultView";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));
vi.mock("@/widgets/funding/FundingResultCelebration", () => ({
  default: () => <div data-testid="celebration" />,
}));

const RESULT: FundingResult = {
  goalAchieved: true,
  collectedAmount: 123456678,
  productName: "소니 WH-1000XM5",
  productImage: "https://example.com/item.png",
  productPrice: 364000,
  giftChanged: false,
  canExtend: true,
  contributors: [{ userId: 1 }],
};

const handlers = {
  onClose: vi.fn(),
  onBuy: vi.fn(),
  onChangeGift: vi.fn(),
  onExtend: vi.fn(),
};

const renderView = (result: Partial<FundingResult> = {}) =>
  render(
    <FundingResultView result={{ ...RESULT, ...result }} reduceMotion={false} {...handlers} />,
  );

beforeEach(() => vi.clearAllMocks());

describe("FundingResultView", () => {
  describe("목표 달성", () => {
    it("모인 금액 제목과 위시 상품 정보, 구매 안내를 보여준다", () => {
      renderView();

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "123,456,678원이 모두 모였어요 선물을 사러갈까요?",
      );
      expect(screen.getByText("364,000원")).toBeInTheDocument();
      expect(screen.getByText("나의 위시 상품")).toBeInTheDocument();
      expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
      expect(screen.getByText("24시간 안에 구매 후 인증해 주세요")).toBeInTheDocument();
    });

    it("쿠팡 버튼을 누르면 onBuy를 호출한다", async () => {
      renderView();

      await userEvent.click(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" }));

      expect(handlers.onBuy).toHaveBeenCalledTimes(1);
    });
  });

  describe("목표 미달", () => {
    const missed = { goalAchieved: false, collectedAmount: 236000 };

    it("모인 금액 제목과 차액 안내를 보여준다", () => {
      renderView(missed);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "236,000원이 모였어요 어떻게 할까요?",
      );
      expect(screen.getByText("차액 128,000원만 보태면 구매할 수 있어요")).toBeInTheDocument();
      expect(screen.getByText("기존 선물")).toBeInTheDocument();
    });

    it("다른 선물로 바꾼 뒤면 '변경한 선물'로 표시한다", () => {
      renderView({ ...missed, giftChanged: true });

      expect(screen.getByText("변경한 선물")).toBeInTheDocument();
      expect(screen.queryByText("기존 선물")).not.toBeInTheDocument();
    });

    it("'다른 선물 고르기'를 누르면 onChangeGift를 호출한다", async () => {
      renderView(missed);

      await userEvent.click(screen.getByRole("button", { name: "다른 선물 고르기" }));

      expect(handlers.onChangeGift).toHaveBeenCalledTimes(1);
    });

    it("'차액으로 구매'를 누르면 onBuy를 호출한다", async () => {
      renderView(missed);

      await userEvent.click(screen.getByRole("button", { name: "차액으로 구매" }));

      expect(handlers.onBuy).toHaveBeenCalledTimes(1);
      expect(handlers.onChangeGift).not.toHaveBeenCalled();
    });

    it("연장할 수 있으면 기간연장 버튼으로 onExtend를 호출한다", async () => {
      renderView(missed);

      await userEvent.click(screen.getByRole("button", { name: "기간연장 (1회)" }));

      expect(handlers.onExtend).toHaveBeenCalledTimes(1);
    });

    it("이미 연장했으면 기간연장 버튼을 숨긴다", () => {
      renderView({ ...missed, canExtend: false });

      expect(screen.queryByRole("button", { name: "기간연장 (1회)" })).not.toBeInTheDocument();
    });
  });

  it("닫기 버튼을 누르면 onClose를 호출한다", async () => {
    renderView();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it("http(s)가 아닌 이미지 URL은 그리지 않는다", () => {
    renderView({ productImage: "javascript:alert(1)" });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
