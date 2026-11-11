import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";

const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

describe("ProductDetailViewSkeleton", () => {
  it("뒤로 가기 버튼 클릭 시 router.back이 호출된다", async () => {
    const user = userEvent.setup();
    render(<ProductDetailViewSkeleton />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });
});
