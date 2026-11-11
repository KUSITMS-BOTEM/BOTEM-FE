import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MenuDropdown, { type MenuDropdownItem } from "@/widgets/home/MenuDropdown";

describe("MenuDropdown", () => {
  const items: MenuDropdownItem[] = [
    { icon: <svg data-testid="icon-0" />, label: "항목1" },
    { icon: <svg data-testid="icon-1" />, label: "항목2", href: "/page2" },
  ];

  it("items 여러 개를 전달하면 각 item의 label이 모두 렌더링된다", () => {
    render(<MenuDropdown items={items} />);

    expect(screen.getByText("항목1")).toBeInTheDocument();
    expect(screen.getByText("항목2")).toBeInTheDocument();
  });

  it("items가 빈 배열이면 행이 렌더링되지 않는다", () => {
    render(<MenuDropdown items={[]} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("href가 있는 item은 Link로 렌더링되고 href 속성이 설정된다", () => {
    render(<MenuDropdown items={items} />);

    expect(screen.getByRole("link", { name: "항목2" })).toHaveAttribute("href", "/page2");
  });

  it("href가 없는 item은 button으로 렌더링된다", () => {
    render(<MenuDropdown items={items} />);

    expect(screen.getByRole("button", { name: "항목1" })).toHaveAttribute("type", "button");
  });

  it("href 없는 item 클릭 시 onSelect가 해당 item과 index로 호출된다", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<MenuDropdown items={items} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: "항목1" }));

    expect(handleSelect).toHaveBeenCalledWith(items[0], 0);
  });

  it("href 있는 item 클릭 시에도 onSelect가 해당 item과 index로 호출된다", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<MenuDropdown items={items} onSelect={handleSelect} />);

    await user.click(screen.getByRole("link", { name: "항목2" }));

    expect(handleSelect).toHaveBeenCalledWith(items[1], 1);
  });

  it("두 번째 이후 item 클릭 시 onSelect에 올바른 index가 전달된다", async () => {
    const threeItems: MenuDropdownItem[] = [
      { icon: <svg />, label: "첫번째" },
      { icon: <svg />, label: "두번째" },
      { icon: <svg />, label: "세번째" },
    ];
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<MenuDropdown items={threeItems} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: "세번째" }));

    expect(handleSelect).toHaveBeenCalledWith(threeItems[2], 2);
  });

  it("onSelect를 전달하지 않고 클릭해도 에러 없이 동작한다", async () => {
    const user = userEvent.setup();
    render(<MenuDropdown items={items} />);

    await user.click(screen.getByRole("button", { name: "항목1" }));

    expect(screen.getByRole("button", { name: "항목1" })).toBeInTheDocument();
  });

  it("item.icon으로 전달한 ReactNode가 그대로 렌더링된다", () => {
    render(<MenuDropdown items={items} />);

    expect(screen.getByTestId("icon-0")).toBeInTheDocument();
    expect(screen.getByTestId("icon-1")).toBeInTheDocument();
  });
});
