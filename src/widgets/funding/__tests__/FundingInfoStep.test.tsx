import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WishResponse } from "@/types/wish/wish";
import FundingInfoStep from "@/widgets/funding/FundingInfoStep";

const wish: WishResponse = {
  id: 1,
  productName: "상품",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
  productUrl: "https://example.com",
  status: "AVAILABLE",
  fundingId: null,
};

const renderStep = () => render(<FundingInfoStep wish={wish} />);

describe("FundingInfoStep", () => {
  it("목표 금액은 비어 있고 안내 문구에 위시 가격을 보여준다", () => {
    renderStep();

    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 금액")).toHaveValue("");
    expect(screen.getByText("기본 상품 가격은 468,000원이에요")).toBeInTheDocument();
  });

  it("기본 상품 가격 칩을 누르면 목표 금액이 위시 가격으로 채워진다", async () => {
    renderStep();

    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

    expect(screen.getByLabelText("목표 금액")).toHaveValue("468,000");
  });

  it("숫자 외 문자는 무시하고 천 단위 쉼표로 보여준다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "12a3456");

    expect(input).toHaveValue("123,456");
  });

  it("직접 입력한 뒤 칩을 누르면 목표 금액이 위시 가격으로 바뀐다", async () => {
    renderStep();

    const input = screen.getByLabelText("목표 금액");
    await userEvent.type(input, "1000");
    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

    expect(input).toHaveValue("468,000");
  });

  it("입력 영역 모션이 끝나면 목표 금액에 포커스한다", async () => {
    renderStep();

    expect(screen.getByLabelText("목표 금액")).not.toHaveFocus();
    await waitFor(() => expect(screen.getByLabelText("목표 금액")).toHaveFocus(), {
      timeout: 3000,
    });
  });
});
