import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WishRequestCompleteContainer from "@/widgets/product-request/WishRequestCompleteContainer";

const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("@/components/effects/hero-motion/HeroMotion", () => ({ default: () => null }));

describe("WishRequestCompleteContainer", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    sessionStorage.setItem("wishRequestSent", "1");
  });

  it("요청 없이 직접 들어오면 /wish/request로 돌려보낸다", () => {
    sessionStorage.clear();
    render(<WishRequestCompleteContainer />);
    expect(replace).toHaveBeenCalledWith("/wish/request");
    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
  });

  it("닫기 버튼을 누르면 /home으로 이동한다", async () => {
    render(<WishRequestCompleteContainer />);
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(replace).toHaveBeenCalledWith("/home");
  });

  it("위시 상품 둘러보기를 누르면 /wish/recommended로 이동한다", async () => {
    render(<WishRequestCompleteContainer />);
    await userEvent.click(screen.getByRole("button", { name: "위시 상품 둘러보기" }));
    expect(push).toHaveBeenCalledWith("/wish/recommended");
  });
});
