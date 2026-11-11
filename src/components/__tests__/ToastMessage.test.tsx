import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ToastMessage from "@/components/ToastMessage";

describe("ToastMessage", () => {
  it("show가 true면 text가 화면에 보인다", () => {
    render(<ToastMessage show text="문구" />);

    expect(screen.getByText("문구")).toBeInTheDocument();
  });

  it("show가 false면 text가 화면에 보이지 않는다", () => {
    render(<ToastMessage show={false} text="문구" />);

    expect(screen.queryByText("문구")).not.toBeInTheDocument();
  });

  it("state가 true면 success 아이콘(16x16)과 success 색상 클래스가 적용된다", () => {
    const { container } = render(<ToastMessage show text="문구" state />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg?.closest("span")).toHaveClass("text-semantic-icon-success");
  });

  it("state가 false면 danger 아이콘(24x24)과 danger 색상 클래스가 적용된다", () => {
    const { container } = render(<ToastMessage show text="문구" state={false} />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg?.closest("span")).toHaveClass("text-semantic-icon-danger");
  });

  it("state가 없고 withIcon을 전달하면 커스텀 아이콘이 default 색상으로 그대로 렌더된다", () => {
    render(<ToastMessage show text="문구" withIcon={<svg data-testid="custom-icon" />} />);

    const icon = screen.getByTestId("custom-icon");
    expect(icon).toBeInTheDocument();
    expect(icon.closest("span")).toHaveClass("text-semantic-icon-default");
  });

  it("state가 true면 withIcon을 같이 넘겨도 무시되고 강제 체크 아이콘이 렌더된다", () => {
    const { container } = render(
      <ToastMessage show text="문구" state withIcon={<svg data-testid="custom-icon" />} />,
    );

    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 16 16");
  });

  it("state와 withIcon이 모두 없으면 아이콘 영역 자체가 렌더되지 않는다", () => {
    const { container } = render(<ToastMessage show text="문구" />);

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("문구").closest("div")?.className).not.toContain("gap-2");
  });

  it("showButton이 true면 buttonText가 버튼으로 렌더되고 클릭 시 onButtonClick이 1번 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ToastMessage show text="문구" showButton buttonText="확인" onButtonClick={handleClick} />,
    );

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("showButton을 생략하면(기본값 false) 버튼이 렌더되지 않는다", () => {
    render(<ToastMessage show text="문구" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("className을 전달하면 기본 클래스와 병합되어 토스트 요소에 적용된다", () => {
    const { container } = render(<ToastMessage show text="문구" className="mt-4" />);

    const toast = container.querySelector(".rounded-2xl") as HTMLElement;
    expect(toast.className).toContain("mt-4");
    expect(toast.className).toContain("w-80");
  });

  it("루트 요소에 role=status가 적용되어 스크린리더가 토스트 등장을 읽을 수 있다", () => {
    const { container } = render(<ToastMessage show text="문구" />);

    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});
