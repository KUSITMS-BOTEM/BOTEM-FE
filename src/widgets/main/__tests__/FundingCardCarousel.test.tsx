import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingCardCarousel, { type FundingCardData } from "@/widgets/main/FundingCardCarousel";

const makeCard = (id: number, title: string): FundingCardData => ({
  id,
  title,
  productName: `상품${id}`,
  productImageUrl: "/product.png",
  progress: 50,
  dDay: id,
  targetAmount: 10000,
});

describe("FundingCardCarousel", () => {
  it("cards가 빈 배열이면 아무것도 렌더하지 않는다", () => {
    const { container } = render(<FundingCardCarousel cards={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("카드가 1장이면 페이지 인디케이터가 없다", () => {
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째")]} />);

    expect(screen.queryByRole("img", { name: /페이지 중/ })).not.toBeInTheDocument();
  });

  it("카드가 1장이면 해당 카드의 제목이 보인다", () => {
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째")]} />);

    expect(screen.getByText("첫번째")).toBeInTheDocument();
  });

  it("카드가 2장 이상이면 '{N}페이지 중 1페이지' 인디케이터를 표시한다", () => {
    render(
      <FundingCardCarousel
        cards={[makeCard(1, "첫번째"), makeCard(2, "두번째"), makeCard(3, "세번째")]}
      />,
    );

    expect(screen.getByRole("img", { name: "3페이지 중 1페이지" })).toBeInTheDocument();
  });

  it("첫 카드가 현재 카드이고 다음 카드는 aria-hidden 미리보기로 렌더된다", () => {
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />);

    const next = screen.getByText("두번째");
    expect(next.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText("첫번째").closest("[aria-hidden='true']")).toBeNull();
  });

  it("첫 카드에서는 이전 미리보기 카드가 없다", () => {
    const { container } = render(
      <FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />,
    );

    expect(container.querySelectorAll("[aria-hidden='true'] article")).toHaveLength(1);
  });

  it("다음 카드 버튼을 누르면 두 번째 카드로 넘어가고 인디케이터가 바뀐다", async () => {
    const user = userEvent.setup();
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />);

    await user.click(screen.getByRole("button", { name: "다음 카드" }));

    expect(await screen.findByRole("img", { name: "2페이지 중 2페이지" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "2개 중 2번째" })).toHaveTextContent("두번째");
  });

  it("첫 카드에서는 이전 버튼이, 마지막 카드에서는 다음 버튼이 비활성 상태다", async () => {
    const user = userEvent.setup();
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />);

    expect(screen.getByRole("button", { name: "이전 카드" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "다음 카드" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );

    await user.click(screen.getByRole("button", { name: "다음 카드" }));

    expect(screen.getByRole("button", { name: "이전 카드" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
    expect(screen.getByRole("button", { name: "다음 카드" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("캐러셀 안에서 오른쪽/왼쪽 화살표 키로 카드를 넘긴다", async () => {
    const user = userEvent.setup();
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />);

    screen.getByRole("region", { name: "펀딩 카드" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("img", { name: "2페이지 중 2페이지" })).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("img", { name: "2페이지 중 1페이지" })).toBeInTheDocument();
  });

  it("마지막 카드를 보던 중 카드 수가 줄면 남은 마지막 카드로 보정된다", async () => {
    const user = userEvent.setup();
    const cards = [makeCard(1, "첫번째"), makeCard(2, "두번째"), makeCard(3, "세번째")];
    const { rerender } = render(<FundingCardCarousel cards={cards} />);

    await user.click(screen.getByRole("button", { name: "다음 카드" }));
    await user.click(screen.getByRole("button", { name: "다음 카드" }));
    rerender(<FundingCardCarousel cards={cards.slice(0, 2)} />);

    expect(screen.getByRole("img", { name: "2페이지 중 2페이지" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "2개 중 2번째" })).toHaveTextContent("두번째");
  });

  it("카드가 1장이면 이전/다음 버튼이 없다", () => {
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째")]} />);

    expect(screen.queryByRole("button", { name: "다음 카드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이전 카드" })).not.toBeInTheDocument();
  });

  it("마지막 카드에서 다음 카드 버튼을 눌러도 넘어가지 않고 포커스가 유지된다", async () => {
    const user = userEvent.setup();
    render(<FundingCardCarousel cards={[makeCard(1, "첫번째"), makeCard(2, "두번째")]} />);
    const nextButton = screen.getByRole("button", { name: "다음 카드" });

    await user.click(nextButton);
    await user.click(nextButton);

    expect(screen.getByRole("img", { name: "2페이지 중 2페이지" })).toBeInTheDocument();
    expect(nextButton).toHaveFocus();
  });
});
