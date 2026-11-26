import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AmountOptionRadio from "@/widgets/funding/AmountOptionRadio";

const renderRadio = (props = {}) =>
  render(
    <AmountOptionRadio
      name="amount"
      checked={false}
      onChange={vi.fn()}
      title="한 명당 47,000원씩"
      description="약 10명이 보태면 다 모여요"
      {...props}
    />,
  );

describe("AmountOptionRadio", () => {
  it("제목·설명을 보여주고 제목으로 라디오에 접근할 수 있다", () => {
    renderRadio();

    expect(screen.getByText("약 10명이 보태면 다 모여요")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /한 명당 47,000원씩/ })).toBeInTheDocument();
  });

  it("checked 값이 라디오 선택 상태에 반영된다", () => {
    const { unmount } = renderRadio({ checked: true });
    expect(screen.getByRole("radio")).toBeChecked();
    unmount();

    renderRadio({ checked: false });
    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("카드를 누르면 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    renderRadio({ onChange });

    await userEvent.click(screen.getByText("한 명당 47,000원씩"));

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
