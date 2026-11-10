import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChipGroup from "@/components/ChipGroup";

const items = [
  { value: "a", label: "사과" },
  { value: "b", label: "바나나" },
  { value: "c", label: "체리" },
];

describe("ChipGroup", () => {
  it("items 여러 개를 전달하면 각 item의 label이 버튼으로 렌더된다", () => {
    render(<ChipGroup items={items} value="a" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "사과" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "바나나" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "체리" })).toBeInTheDocument();
  });

  it("value와 일치하는 item만 선택 상태(aria-pressed=true)로 렌더되고 나머지는 false다", () => {
    render(<ChipGroup items={items} value="b" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "사과" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "바나나" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "체리" })).toHaveAttribute("aria-pressed", "false");
  });

  it("선택되지 않은 Chip을 클릭하면 onChange가 해당 item의 value로 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipGroup items={items} value="b" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "사과" }));

    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("이미 선택된 Chip을 클릭해도 onChange가 해당 value로 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<ChipGroup items={items} value="b" onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "바나나" }));

    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("items가 빈 배열이면 버튼이 렌더되지 않는다", () => {
    render(<ChipGroup items={[]} value="" onChange={vi.fn()} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("className을 전달하면 wrapper에 병합된다", () => {
    const { container } = render(
      <ChipGroup items={items} value="a" onChange={vi.fn()} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
