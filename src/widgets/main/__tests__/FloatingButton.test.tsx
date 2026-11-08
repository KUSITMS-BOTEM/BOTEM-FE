import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FloatingButton from "@/widgets/main/FloatingButton";
import { type MenuDropdownItem } from "@/widgets/main/MenuDropdown";

describe("FloatingButton", () => {
  const items: MenuDropdownItem[] = [
    { icon: <svg data-testid="icon-0" />, label: "항목1" },
    { icon: <svg data-testid="icon-1" />, label: "항목2", href: "/page2" },
  ];

  it("초기 렌더 시 '추가 메뉴 열기' 버튼만 보이고 메뉴 항목은 보이지 않는다", () => {
    render(<FloatingButton items={items} />);

    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toBeInTheDocument();
    expect(screen.queryByText("항목1")).not.toBeInTheDocument();
    expect(screen.queryByText("항목2")).not.toBeInTheDocument();
  });

  it("버튼 클릭 시 aria-label이 '추가 메뉴 닫기'로 바뀌고 전달한 items의 label이 나타난다", async () => {
    const user = userEvent.setup();
    render(<FloatingButton items={items} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));

    expect(screen.getByRole("button", { name: "추가 메뉴 닫기" })).toBeInTheDocument();
    expect(screen.getByText("항목1")).toBeInTheDocument();
    expect(screen.getByText("항목2")).toBeInTheDocument();
  });

  it("열린 상태에서 버튼을 다시 클릭하면 닫히고 items가 사라진다", async () => {
    const user = userEvent.setup();
    render(<FloatingButton items={items} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await user.click(screen.getByRole("button", { name: "추가 메뉴 닫기" }));

    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toBeInTheDocument();
    expect(screen.queryByText("항목1")).not.toBeInTheDocument();
  });

  it("열린 상태에서 Dim 영역을 클릭하면 메뉴가 닫힌다", async () => {
    const user = userEvent.setup();
    const { container } = render(<FloatingButton items={items} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    const dim = container.querySelector(".bg-semantic-background-dim");
    expect(dim).not.toBeNull();

    await user.click(dim!);

    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toBeInTheDocument();
    expect(screen.queryByText("항목1")).not.toBeInTheDocument();
  });

  it("항목 선택 시 onSelect가 해당 item/index로 호출되고 메뉴가 닫힌다", async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();
    render(<FloatingButton items={items} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await user.click(screen.getByRole("button", { name: "항목1" }));

    expect(handleSelect).toHaveBeenCalledWith(items[0], 0);
    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toBeInTheDocument();
    expect(screen.queryByText("항목1")).not.toBeInTheDocument();
  });

  it("onSelect를 전달하지 않고 항목을 클릭해도 에러 없이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<FloatingButton items={items} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await user.click(screen.getByRole("button", { name: "항목1" }));

    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toBeInTheDocument();
  });

  it("items가 빈 배열이면 열어도 항목 없이 버튼만 보인다", async () => {
    const user = userEvent.setup();
    render(<FloatingButton items={[]} />);

    await user.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "추가 메뉴 닫기" })).toBeInTheDocument();
  });

  it("className prop이 루트 컨테이너에 적용된다", () => {
    const { container } = render(<FloatingButton items={items} className="custom-floating" />);

    expect(container.querySelector(".custom-floating")).not.toBeNull();
  });
});
