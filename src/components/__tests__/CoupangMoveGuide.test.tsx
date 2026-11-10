import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CoupangMoveGuide from "@/components/CoupangMoveGuide";

// vitest(jsdom) 환경은 정적 png import를 {src,width,height} 객체가 아닌 문자열로 반환해
// next/image가 "width 누락" 에러를 던진다. CoupangLogo 실제 이미지를 그대로 쓰기 위해
// next/image만 단순 img로 대체한다.
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CoupangMoveGuide", () => {
  it("안내 문구와 쿠팡 이동 버튼이 렌더된다", () => {
    render(<CoupangMoveGuide />);

    expect(screen.getByText("아직 상품 링크가 없나요?")).toBeInTheDocument();
    expect(
      screen.getByText("쿠팡에서 상품을 고른 뒤 링크 복사하고 붙여넣어 주세요"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "쿠팡 이동" })).toBeInTheDocument();
  });

  it('"쿠팡 이동" 버튼을 클릭하면 쿠팡 URL이 새 탭으로 열린다', async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(<CoupangMoveGuide />);

    await user.click(screen.getByRole("button", { name: "쿠팡 이동" }));

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.coupang.com",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("className을 전달하면 루트 요소에 반영된다", () => {
    const { container } = render(<CoupangMoveGuide className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
