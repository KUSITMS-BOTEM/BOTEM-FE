import { render, screen } from "@testing-library/react";

import FriendWishEmptyView from "@/widgets/friend/FriendWishEmptyView";

describe("FriendWishEmptyView", () => {
  it("위시가 없다는 안내와 다시 알려준다는 문구를 보여준다", () => {
    render(<FriendWishEmptyView />);

    expect(screen.getByText(/아직 위시가 없어요/)).toHaveTextContent(
      "아직 위시가 없어요 위시 담겼을 때 다시 알려드릴게요",
      { normalizeWhitespace: true },
    );
  });
});
