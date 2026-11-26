import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RecommendedAmountSheet from "@/widgets/funding/RecommendedAmountSheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const renderSheet = (props = {}) => {
  const onSelect = vi.fn();
  render(
    <RecommendedAmountSheet
      open
      targetAmount={468000}
      value=""
      onSelect={onSelect}
      onClose={vi.fn()}
      {...props}
    />,
  );
  return { onSelect };
};

const selectButton = () => screen.getByRole("button", { name: "선택하기" });

describe("RecommendedAmountSheet", () => {
  it("목표 금액을 5·10·20명으로 나눈 선택지와 직접 정하기를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("한 명당 94,000원씩")).toBeInTheDocument();
    expect(screen.getByText("약 5명이 보태면 다 모여요")).toBeInTheDocument();
    expect(screen.getByText("한 명당 47,000원씩")).toBeInTheDocument();
    expect(screen.getByText("한 명당 24,000원씩")).toBeInTheDocument();
    expect(screen.getByText("직접 정할게요")).toBeInTheDocument();
  });

  it("아무것도 고르지 않으면 선택하기가 비활성화돼 있다", () => {
    renderSheet();

    expect(selectButton()).toBeDisabled();
  });

  it("선택지를 고르고 선택하기를 누르면 그 금액으로 onSelect를 호출한다", async () => {
    const { onSelect } = renderSheet();

    await userEvent.click(screen.getByRole("radio", { name: /한 명당 47,000원씩/ }));
    await userEvent.click(selectButton());

    expect(onSelect).toHaveBeenCalledWith("47000");
  });

  it("직접 정할게요를 고르면 입력 필드가 나타나고 금액을 입력해야 선택하기가 활성화된다", async () => {
    const { onSelect } = renderSheet();

    await userEvent.click(screen.getByRole("radio", { name: /직접 정할게요/ }));
    expect(selectButton()).toBeDisabled();
    await userEvent.type(screen.getByLabelText("한 명당 금액"), "25000");

    expect(screen.getByText("25,000원씩 약 19명이 보태면 다 모여요")).toBeInTheDocument();
    await userEvent.click(selectButton());
    expect(onSelect).toHaveBeenCalledWith("25000");
  });

  it("직접 입력한 금액이 목표 금액을 넘으면 안내하고 선택하기를 막는다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("radio", { name: /직접 정할게요/ }));
    await userEvent.type(screen.getByLabelText("한 명당 금액"), "500000");

    expect(screen.getByText("목표 금액 이하로 입력해주세요")).toBeInTheDocument();
    expect(selectButton()).toBeDisabled();
  });

  it("확정된 값이 선택지와 같으면 그 선택지를, 다르면 직접 입력으로 복원한다", () => {
    const { unmount } = render(
      <RecommendedAmountSheet
        open
        targetAmount={468000}
        value="47000"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: /한 명당 47,000원씩/ })).toBeChecked();
    unmount();

    renderSheet({ value: "30000" });
    expect(screen.getByRole("radio", { name: /직접 정할게요/ })).toBeChecked();
    expect(screen.getByLabelText("한 명당 금액")).toHaveValue("30,000");
  });
});
