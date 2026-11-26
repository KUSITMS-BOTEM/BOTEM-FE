import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingAmountStep from "@/widgets/funding/FundingAmountStep";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const renderStep = (onNext = vi.fn()) =>
  render(<FundingAmountStep basePrice={468000} onNext={onNext} />);

// 목표 금액을 입력하고 포커스를 빼 추천 금액 단계를 연다
const reveal = async (amount = "468000") => {
  await userEvent.type(screen.getByLabelText("목표 금액"), `${amount}{Enter}`);
};

describe("FundingAmountStep", () => {
  it("목표 금액만 보이고 안내 문구에 상품 가격을 보여준다", () => {
    renderStep();

    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 금액")).toHaveValue("");
    expect(screen.getByText("기본 상품 가격은 468,000원이에요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^추천 금액/ })).not.toBeInTheDocument();
  });

  it("기본 상품 가격 칩을 누르면 목표 금액이 채워지고 추천 금액 단계가 열린다", async () => {
    renderStep();

    await userEvent.click(screen.getByRole("button", { name: "기본 상품 가격" }));

    expect(screen.getByLabelText("목표 금액")).toHaveValue("468,000");
    expect(screen.getByText("한 명당 얼마씩 모을까요?")).toBeInTheDocument();
  });

  it("목표 금액을 입력하고 Enter를 누르면 추천 금액 단계가 열린다", async () => {
    renderStep();

    await reveal();

    expect(screen.getByText("한 명당 얼마씩 모을까요?")).toBeInTheDocument();
    expect(screen.getByText("친구가 참고할 금액이에요. 건너뛰어도 돼요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^추천 금액/ })).toBeInTheDocument();
  });

  it("목표 금액이 비어 있으면 포커스가 빠져도 추천 금액 단계가 열리지 않는다", async () => {
    renderStep();

    await userEvent.click(screen.getByLabelText("목표 금액"));
    await userEvent.tab();

    expect(screen.queryByRole("button", { name: /^추천 금액/ })).not.toBeInTheDocument();
  });

  it("추천 금액을 정하지 않아도 다음 버튼으로 진행하고 추천 금액은 빈 값이다", async () => {
    const onNext = vi.fn();
    renderStep(onNext);
    await reveal();

    await userEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onNext).toHaveBeenCalledWith({ targetAmount: "468000", recommendedAmount: "" });
  });

  it("추천 금액 시트에서 고르면 '한 명당 N원씩'이 채워지고 다음 때 값이 전달된다", async () => {
    const onNext = vi.fn();
    renderStep(onNext);
    await reveal();

    await userEvent.click(screen.getByRole("button", { name: /^추천 금액/ }));
    await userEvent.click(screen.getByRole("radio", { name: /한 명당 47,000원씩/ }));
    await userEvent.click(screen.getByRole("button", { name: "선택하기" }));

    // 닫히는 시트의 선택지와 겹치지 않도록 추천 금액 필드 안에서 확인한다
    expect(screen.getByRole("button", { name: /^추천 금액/ })).toHaveTextContent(
      "한 명당 47,000원씩",
    );
    await userEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(onNext).toHaveBeenCalledWith({ targetAmount: "468000", recommendedAmount: "47000" });
  });

  it("목표 금액을 추천 금액보다 작게 바꾸면 추천 금액을 비운다", async () => {
    renderStep();
    await reveal();
    await userEvent.click(screen.getByRole("button", { name: /^추천 금액/ }));
    await userEvent.click(screen.getByRole("radio", { name: /한 명당 94,000원씩/ }));
    await userEvent.click(screen.getByRole("button", { name: "선택하기" }));

    const input = screen.getByLabelText("목표 금액");
    await userEvent.clear(input);
    await userEvent.type(input, "50000");

    expect(screen.getByRole("button", { name: /^추천 금액/ })).toHaveTextContent(
      "한 명당 금액을 얼마 추천할까요?",
    );
  });

  it("추천 금액 단계가 열린 뒤 목표 금액을 지우면 다음 버튼이 비활성화된다", async () => {
    renderStep();
    await reveal();

    await userEvent.clear(screen.getByLabelText("목표 금액"));

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });
});

describe("FundingAmountStep 수정 모드", () => {
  const initialValues = { targetAmount: "429000", recommendedAmount: "50000" };
  const renderEdit = (onNext = vi.fn()) =>
    render(
      <FundingAmountStep
        basePrice={468000}
        onNext={onNext}
        initialValues={initialValues}
        submitLabel="수정 완료"
      />,
    );

  it("입력했던 값이 채워져 있고 수정 완료가 비활성화돼 있다", () => {
    renderEdit();

    expect(screen.getByLabelText("목표 금액")).toHaveValue("429,000");
    expect(screen.getByText("한 명당 50,000원씩")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정 완료" })).toBeDisabled();
  });

  it("값을 바꾸면 수정 완료가 활성화되고 바뀐 값으로 onNext를 호출한다", async () => {
    const onNext = vi.fn();
    renderEdit(onNext);

    await userEvent.type(screen.getByLabelText("목표 금액"), "0");
    await userEvent.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(onNext).toHaveBeenCalledWith({ targetAmount: "4290000", recommendedAmount: "50000" });
  });
});
