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

  it("사진을 고른 뒤 보내기를 누르면 사진과 감사 메세지로 onSubmit을 호출한다", async () => {
    const onSubmit = vi.fn();
    const { container } = renderView({ onSubmit });
    await uploadPhoto(container);
    await userEvent.type(screen.getByRole("textbox"), "고마워!");

    await userEvent.click(screen.getByRole("button", { name: "선물 도착 인증 보내기" }));

    expect(onSubmit).toHaveBeenCalledWith({ image: photo, thankYouMessage: "고마워!" });
  });

  it("제출 중이면 사진을 골라도 보내기 버튼이 비활성이다", async () => {
    const { container } = renderView({ isSubmitting: true });
    await uploadPhoto(container);

    expect(screen.getByRole("button", { name: /선물 도착 인증 보내기/ })).toBeDisabled();
  });
});
