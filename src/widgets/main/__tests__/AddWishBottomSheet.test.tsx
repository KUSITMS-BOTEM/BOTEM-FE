import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddWishBottomSheet from "@/widgets/main/AddWishBottomSheet";

// vitest(jsdom) 환경은 정적 png import를 {src,width,height} 객체가 아닌 문자열로 반환해
// next/image가 "width 누락" 에러를 던진다. 내부에서 쓰이는 CoupangMoveGuide의 이미지를
// 그대로 쓰기 위해 next/image만 단순 img로 대체한다.
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

const baseProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

describe("AddWishBottomSheet", () => {
  it("open이 true면 타이틀 문구와 상품 링크 입력 필드가 보인다", () => {
    render(<AddWishBottomSheet {...baseProps} />);

    expect(screen.getByText("갖고 싶은 상품 링크를 넣어주세요")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "상품 링크" })).toBeInTheDocument();
  });

  it("상품 링크 입력값이 비어 있으면 추가하기 버튼이 비활성화된다", () => {
    render(<AddWishBottomSheet {...baseProps} />);

    expect(screen.getByRole("button", { name: "추가하기" })).toBeDisabled();
  });

  it("초기 상태(빈 입력값)에서는 쿠팡 이동 가이드가 보인다", () => {
    render(<AddWishBottomSheet {...baseProps} />);

    expect(screen.getByText("아직 상품 링크가 없나요?")).toBeInTheDocument();
  });

  it("유효한 URL을 입력하고 1초가 지나면 쿠팡 이동 가이드가 사라지고 상품 사진 추가 영역이 보인다", async () => {
    const user = userEvent.setup();
    render(<AddWishBottomSheet {...baseProps} />);

    await user.type(
      screen.getByRole("textbox", { name: "상품 링크" }),
      "https://www.coupang.com/vp/products/123",
    );

    expect(screen.getByRole("button", { name: "추가하기" })).not.toBeDisabled();
    await waitFor(
      () => expect(screen.queryByText("아직 상품 링크가 없나요?")).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(screen.getByText("상품 사진을 추가해주세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상품 이미지 선택" })).toBeInTheDocument();
  });

  it("유효하지 않은 값으로 추가하기를 클릭하면 에러 토스트가 보이고 onSubmit은 호출되지 않는다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddWishBottomSheet {...baseProps} onSubmit={handleSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "상품 링크" }), "abc");
    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(screen.getByText("올바른 링크 형식이 아니에요")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("유효한 URL로 추가하기를 클릭하면 onSubmit이 해당 URL로 호출된다", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddWishBottomSheet {...baseProps} onSubmit={handleSubmit} />);

    const productLink = "https://www.coupang.com/vp/products/123";
    await user.type(screen.getByRole("textbox", { name: "상품 링크" }), productLink);
    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(productLink);
  });

  it("에러 토스트는 2500ms 뒤 자동으로 사라진다", async () => {
    const user = userEvent.setup();
    render(<AddWishBottomSheet {...baseProps} />);

    await user.type(screen.getByRole("textbox", { name: "상품 링크" }), "abc");
    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(screen.getByText("올바른 링크 형식이 아니에요")).toBeInTheDocument();

    await waitFor(
      () => expect(screen.queryByText("올바른 링크 형식이 아니에요")).not.toBeInTheDocument(),
      { timeout: 4000 },
    );
  }, 6000);
});
