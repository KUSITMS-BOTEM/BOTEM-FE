import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendWishResponse } from "@/types/friend/friend";
import FriendSurpriseWishSheet from "@/widgets/friend/FriendSurpriseWishSheet";

const wishes: FriendWishResponse[] = [
  {
    wishId: 1,
    productName: "모자",
    productImageUrl: null,
    price: 429000,
  },
  {
    wishId: 2,
    productName: "Matin Kim 지갑",
    productImageUrl: null,
    price: 327500,
  },
];

describe("FriendSurpriseWishSheet", () => {
  it("안내 문구와 위시마다 상품명·가격·선택하기 버튼을 보여준다", () => {
    render(<FriendSurpriseWishSheet open wishes={wishes} onClose={vi.fn()} onSelect={vi.fn()} />);

    expect(screen.getByText(/어떤 위시 상품으로/)).toBeInTheDocument();
    expect(
      screen.getByText(/받는 사람이 볼 수 없게 비밀로 진행되는 펀딩이에요/),
    ).toBeInTheDocument();
    expect(screen.getByText("Matin Kim 지갑")).toBeInTheDocument();
    expect(screen.getByText("327,500원")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /선택하기/ })).toHaveLength(2);
  });

  it("선택하기를 누르면 그 위시로 onSelect를 호출한다", async () => {
    const onSelect = vi.fn();
    render(<FriendSurpriseWishSheet open wishes={wishes} onClose={vi.fn()} onSelect={onSelect} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Matin Kim 지갑 선택하기" }));

    expect(onSelect).toHaveBeenCalledWith(wishes[1]);
  });

  it("닫기 버튼을 누르면 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<FriendSurpriseWishSheet open wishes={wishes} onClose={onClose} onSelect={vi.fn()} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
