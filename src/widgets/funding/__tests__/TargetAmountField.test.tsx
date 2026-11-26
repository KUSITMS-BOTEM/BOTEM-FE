import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import TargetAmountField from "@/widgets/funding/TargetAmountField";

const renderField = (price: number, onChange = vi.fn()) =>
  render(
    <TargetAmountField
      price={price}
      value=""
      showPriceChip
      onChange={onChange}
      onPriceChipSelect={vi.fn()}
      onBlur={vi.fn()}
    />,
  );

const input = (value: string) =>
  fireEvent.change(screen.getByLabelText("목표 금액"), { target: { value } });

describe("TargetAmountField", () => {
  it("상품 가격보다 크게 입력하면 상품 가격을 넘기고 안내 토스트를 보여준다", () => {
    const onChange = vi.fn();
    renderField(468000, onChange);

    input("500,000");

    expect(onChange).toHaveBeenCalledWith("468000");
    expect(screen.getByRole("status")).toHaveTextContent("최대 468,000원까지 설정할 수 있어요");
  });

  it("상품 가격 이하로 입력하면 그대로 넘기고 토스트를 보여주지 않는다", () => {
    const onChange = vi.fn();
    renderField(468000, onChange);

    input("468,000");

    expect(onChange).toHaveBeenCalledWith("468000");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("상품 가격이 0원이면 제한하지 않고 토스트도 없다", () => {
    const onChange = vi.fn();
    renderField(0, onChange);

    input("1000");

    expect(onChange).toHaveBeenCalledWith("1000");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("토스트는 도움말을 가리지 않게 도움말 뒤에 놓인다", () => {
    render(
      <TargetAmountField
        price={468000}
        value=""
        showPriceChip
        onChange={vi.fn()}
        onPriceChipSelect={vi.fn()}
        onBlur={vi.fn()}>
        <p>도움말</p>
      </TargetAmountField>,
    );

    expect(screen.getByText("도움말").compareDocumentPosition(screen.getByRole("status"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("토스트는 잠시 뒤 사라진다", async () => {
    renderField(468000);
    input("500000");

    // 퇴장 모션(framer)은 fake timer로 진행되지 않아 실제 시간으로 기다린다
    await waitFor(() => expect(screen.getByRole("status")).toBeEmptyDOMElement(), {
      timeout: 4000,
    });
  });
});
