import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Title from "@/components/Title";

describe("Title", () => {
  it("title 텍스트가 렌더된다", () => {
    render(<Title title="제목" />);

    expect(screen.getByText("제목")).toBeInTheDocument();
  });

  it("description을 생략하면 렌더되지 않는다", () => {
    render(<Title title="제목" />);

    expect(screen.queryByText("설명")).not.toBeInTheDocument();
  });

  it("description을 전달하면 텍스트가 렌더된다", () => {
    render(<Title title="제목" description="설명" />);

    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("showButton을 생략하면 기본값 true로 버튼이 렌더되고 기본 buttonLabel이 표시된다", () => {
    render(<Title title="제목" />);

    expect(screen.getByRole("button", { name: "버튼" })).toBeInTheDocument();
  });

  it("showButton=false면 버튼이 렌더되지 않는다", () => {
    render(<Title title="제목" showButton={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("buttonLabel을 전달하면 해당 텍스트로 버튼이 렌더된다", () => {
    render(<Title title="제목" buttonLabel="확인" />);

    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("버튼 클릭 시 onButtonClick이 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Title title="제목" onButtonClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "버튼" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("type을 생략하면 기본값 pretendard로 title에 font-pretendard font-bold 클래스가 적용된다", () => {
    render(<Title title="제목" />);
    const titleElement = screen.getByText("제목");

    expect(titleElement.className).toContain("font-pretendard");
    expect(titleElement.className).toContain("font-bold");
  });

  it('type="a2z"면 title에 font-a2-z font-semibold 클래스가 적용된다', () => {
    render(<Title title="제목" type="a2z" />);
    const titleElement = screen.getByText("제목");

    expect(titleElement.className).toContain("font-a2-z");
    expect(titleElement.className).toContain("font-semibold");
    expect(titleElement.className).not.toContain("font-pretendard");
  });

  it("titleSize를 생략하면 기본값 24px이 title에 적용된다", () => {
    render(<Title title="제목" />);

    expect(screen.getByText("제목")).toHaveStyle({ fontSize: "24px" });
  });

  it("titleSize를 전달하면 해당 값이 title에 적용된다", () => {
    render(<Title title="제목" titleSize={32} />);

    expect(screen.getByText("제목")).toHaveStyle({ fontSize: "32px" });
  });

  it("descriptionSize를 전달하면 해당 값이 description에 적용된다", () => {
    render(<Title title="제목" description="설명" descriptionSize={12} />);

    expect(screen.getByText("설명")).toHaveStyle({ fontSize: "12px" });
  });

  it("className prop이 루트 요소에 기존 클래스와 함께 적용된다", () => {
    const { container } = render(<Title title="제목" className="mt-4" />);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("mt-4");
    expect(root.className).toContain("flex");
  });
});
