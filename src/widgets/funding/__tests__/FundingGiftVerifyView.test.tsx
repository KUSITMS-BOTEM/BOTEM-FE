import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingGiftVerifyView from "@/widgets/funding/FundingGiftVerifyView";

// next/image는 정적 경로 이미지에 width 검증을 하므로 단순 img로 대체한다 (AddImage 테스트와 동일)
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// jsdom에는 URL.createObjectURL·createImageBitmap이 없어 AddImage 테스트처럼 직접 모킹한다
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
  global.createImageBitmap = vi.fn(() =>
    Promise.resolve({ close: vi.fn() }),
  ) as unknown as typeof createImageBitmap;
});

const photo = new File(["dummy"], "gift.png", { type: "image/png" });

const renderView = (props: Partial<Parameters<typeof FundingGiftVerifyView>[0]> = {}) =>
  render(
    <FundingGiftVerifyView
      productName="에어팟"
      replacementProductName={null}
      productImageUrl="/airpods.png"
      isSubmitting={false}
      onSubmit={vi.fn()}
      {...props}
    />,
  );

const uploadPhoto = async (container: HTMLElement) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, photo);
  // 디코딩 검증이 비동기라 미리보기가 나타나면 선택이 반영된 것이다
  await waitFor(() => expect(container.querySelector("img[src='blob:mock-url']")).toBeTruthy());
};

describe("FundingGiftVerifyView", () => {
  it("사진을 고르지 않으면 '선물 도착 인증 보내기'가 비활성이다", () => {
    renderView();

    expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeDisabled();
  });

  it("사진만 고르고 감사 메세지가 비어 있거나 공백뿐이면 비활성이다", async () => {
    const { container } = renderView();
    await uploadPhoto(container);
    const button = screen.getByRole("button", { name: "선물 도착 인증 보내기" });

    expect(button).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "   ");
    expect(button).toBeDisabled();
  });

  it("감사 메세지만 쓰고 사진이 없으면 비활성이다", async () => {
    renderView();
    await userEvent.type(screen.getByRole("textbox"), "고마워!");

    expect(screen.getByRole("button", { name: "선물 도착 인증 보내기" })).toBeDisabled();
  });

  it("상품이 바뀌지 않았으면 위시 상품을 받았다고 안내한다", () => {
    renderView();

    expect(screen.getByText("위시 상품이였던")).toBeInTheDocument();
    expect(screen.getByText("에어팟을 받았어요")).toBeInTheDocument();
  });

  it("다른 상품으로 바꿔 받았으면 기존 선물에서 바뀐 상품을 안내한다", () => {
    renderView({ replacementProductName: "갤럭시 버즈" });

    expect(screen.getByText("기존 선물 에어팟에서")).toBeInTheDocument();
    expect(screen.getByText("갤럭시 버즈로 받았어요")).toBeInTheDocument();
  });

  it("사진과 감사 메세지를 모두 채운 뒤 보내기를 누르면 사진과 감사 메세지로 onSubmit을 호출한다", async () => {
    const onSubmit = vi.fn();
    const { container } = renderView({ onSubmit });
    await uploadPhoto(container);
    await userEvent.type(screen.getByRole("textbox"), "고마워!");

    await userEvent.click(screen.getByRole("button", { name: "선물 도착 인증 보내기" }));

    expect(onSubmit).toHaveBeenCalledWith({ image: photo, thankYouMessage: "고마워!" });
  });

  it("제출 중이면 사진과 메세지를 채워도 보내기 버튼이 비활성이다", async () => {
    const { container } = renderView({ isSubmitting: true });
    await uploadPhoto(container);
    await userEvent.type(screen.getByRole("textbox"), "고마워!");

    expect(screen.getByRole("button", { name: /선물 도착 인증 보내기/ })).toBeDisabled();
  });
});
