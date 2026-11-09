import { render, screen } from "@testing-library/react";

import FundingCardGiftCover from "@/widgets/main/FundingCardGiftCover";

const findText = (text: string) =>
  screen.getByText((_, el) => el?.tagName === "P" && el.textContent === text);

describe("FundingCardGiftCover", () => {
  it("notification이면 pendingCount를 넣은 안내 문구를 표시한다", () => {
    render(
      <FundingCardGiftCover
        type="notification"
        pendingCount={4}
        productImageUrl="/a.png"
        animateGift
      />,
    );

    expect(findText("확인대기 4건을\n확인하고 펑 터트려봐요!")).toBeInTheDocument();
  });

  it("notification에서 pendingCount가 0이면 '확인대기 0건'으로 표시한다", () => {
    render(
      <FundingCardGiftCover
        type="notification"
        pendingCount={0}
        productImageUrl="/a.png"
        animateGift
      />,
    );

    expect(findText("확인대기 0건을\n확인하고 펑 터트려봐요!")).toBeInTheDocument();
  });

  it("open이면 pendingCount와 무관하게 '펑! 터트려볼까요?'를 표시한다", () => {
    render(
      <FundingCardGiftCover type="open" pendingCount={9} productImageUrl="/a.png" animateGift />,
    );

    expect(findText("펑!\n터트려볼까요?")).toBeInTheDocument();
    expect(screen.queryByText(/확인대기/)).not.toBeInTheDocument();
  });
});
