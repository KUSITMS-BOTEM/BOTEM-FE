import { render, screen } from "@testing-library/react";

import type { FriendWishResponse } from "@/types/friend/friend";
import FriendWishSection from "@/widgets/friend/FriendWishSection";

const wishes: FriendWishResponse[] = [
  { wishId: 1, productName: "모자", productImageUrl: null, price: 429000 },
  { wishId: 2, productName: "Matin Kim 지갑", productImageUrl: null, price: 327500 },
];

describe("FriendWishSection", () => {
  it("위시가 있으면 개수·상품명·가격과 서프라이즈 열기 버튼을 보여준다", () => {
    render(<FriendWishSection wishes={wishes} />);

    expect(screen.getByRole("heading", { name: "위시 2개" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("모자")).toBeInTheDocument();
    expect(screen.getByText("429,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /서프라이즈 열기/ })).toBeInTheDocument();
  });

  it("위시가 없으면 엠티뷰를 보여주고 서프라이즈 열기 버튼은 숨긴다", () => {
    render(<FriendWishSection wishes={[]} />);

    expect(screen.getByRole("heading", { name: "위시 0개" })).toBeInTheDocument();
    expect(screen.getByText(/아직 위시가 없어요/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /서프라이즈 열기/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
