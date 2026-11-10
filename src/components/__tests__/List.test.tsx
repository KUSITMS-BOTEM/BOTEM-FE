import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import List from "@/components/List";

describe("List", () => {
  it("title과 description이 표시된다", () => {
    render(<List title="타이틀" description="설명" />);

    expect(screen.getByText("타이틀")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("type=default면 leading으로 넘긴 아이콘이 렌더된다", () => {
    render(<List type="default" title="타이틀" leading={<svg data-testid="leading" />} />);

    expect(screen.getByTestId("leading")).toBeInTheDocument();
  });

  it("type=product에 thumbnailSrc가 없으면 이미지를 렌더하지 않는다", () => {
    const { container } = render(<List type="product" title="타이틀" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("type=product에 thumbnailSrc가 있으면 thumbnailAlt로 이미지를 렌더한다", () => {
    render(
      <List
        type="product"
        title="타이틀"
        thumbnailSrc="/thumbnail.png"
        thumbnailAlt="상품 이미지"
      />,
    );

    expect(screen.getByRole("img", { name: "상품 이미지" })).toBeInTheDocument();
  });

  it("thumbnailAlt를 생략하면 장식용 이미지로 처리된다", () => {
    const { container } = render(
      <List type="product" title="타이틀" thumbnailSrc="/thumbnail.png" />,
    );

    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("썸네일 이미지 로드에 실패하면 이미지를 숨긴다", () => {
    render(
      <List type="product" title="타이틀" thumbnailSrc="/broken.png" thumbnailAlt="상품 이미지" />,
    );

    fireEvent.error(screen.getByRole("img", { name: "상품 이미지" }));

    expect(screen.queryByRole("img", { name: "상품 이미지" })).not.toBeInTheDocument();
  });

  it("로드에 실패한 뒤 thumbnailSrc가 바뀌면 새 이미지를 다시 렌더한다", () => {
    const { rerender } = render(
      <List type="product" title="타이틀" thumbnailSrc="/broken.png" thumbnailAlt="상품 이미지" />,
    );
    fireEvent.error(screen.getByRole("img", { name: "상품 이미지" }));

    rerender(
      <List type="product" title="타이틀" thumbnailSrc="/next.png" thumbnailAlt="상품 이미지" />,
    );

    expect(screen.getByRole("img", { name: "상품 이미지" })).toBeInTheDocument();
  });

  it("titleUp을 전달하면 description이 title보다 먼저 렌더된다", () => {
    const { container } = render(<List title="타이틀" description="설명" titleUp />);
    const texts = Array.from(container.querySelectorAll("p")).map(p => p.textContent);

    expect(texts).toEqual(["설명", "타이틀"]);
  });

  it("type=default면 thumbnailSrc를 넘겨도 썸네일을 렌더하지 않는다", () => {
    const { container } = render(<List title="타이틀" thumbnailSrc="/thumbnail.png" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("right가 없으면 오른쪽 요소가 렌더되지 않는다", () => {
    render(<List title="타이틀" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("right로 넘긴 버튼을 클릭하면 onClick이 호출된다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <List
        title="타이틀"
        right={
          <button type="button" onClick={handleClick}>
            버튼
          </button>
        }
      />,
    );

    await user.click(screen.getByRole("button", { name: "버튼" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
