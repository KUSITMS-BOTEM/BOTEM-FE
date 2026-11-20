import { render, screen, waitFor } from "@testing-library/react";
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

  it("스토리지 접근이 차단되면 /wish/request로 돌려보낸다", () => {
    // Node 네이티브 webstorage가 jsdom 것을 가려 Storage.prototype이 sessionStorage의 프로토타입이 아닐 수 있다
    vi.spyOn(Object.getPrototypeOf(sessionStorage), "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render(<WishRequestCompleteContainer />);
    expect(replace).toHaveBeenCalledWith("/wish/request");
    vi.restoreAllMocks();
  });

  it("닫기 버튼을 누르면 /home으로 이동하고 플래그를 지운다", async () => {
    render(<WishRequestCompleteContainer />);
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    expect(sessionStorage.getItem("wishRequestSent")).toBeNull();
  });

  it("위시 상품 둘러보기를 누르면 /wish/recommended로 이동하고 플래그를 지운다", async () => {
    render(<WishRequestCompleteContainer />);
    await userEvent.click(screen.getByRole("button", { name: "위시 상품 둘러보기" }));
    expect(push).toHaveBeenCalledWith("/wish/recommended");
    expect(sessionStorage.getItem("wishRequestSent")).toBeNull();
  });
});
