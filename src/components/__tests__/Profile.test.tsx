import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Profile from "@/components/Profile";

// vitest(jsdom) 환경은 정적 이미지 import가 {src,width,height} 객체가 아닌 문자열로 반환되어
// next/image가 "width 누락" 에러를 던진다. 미리보기 img 렌더만 확인하기 위해 단순 img로 대체한다.
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
const mockCreateImageBitmap = vi.fn(() => Promise.resolve({ close: vi.fn() }));

// jsdom에는 URL.createObjectURL/revokeObjectURL·createImageBitmap이 구현되어 있지 않아 직접 모킹한다.
beforeAll(() => {
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
  global.createImageBitmap = mockCreateImageBitmap as unknown as typeof createImageBitmap;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Profile", () => {
  it("imageUrl이 없으면 기본 아바타 아이콘이 보이고 이미지는 렌더되지 않는다", () => {
    const { container } = render(<Profile showIconButton={false} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("imageUrl이 주어지면 해당 URL로 이미지가 렌더되고 기본 아바타는 보이지 않는다", () => {
    const { container } = render(
      <Profile imageUrl="https://example.com/a.png" showIconButton={false} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/a.png");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("showIconButton 기본값(true)이면 아이콘 버튼과 숨겨진 파일 input이 렌더된다", () => {
    const { container } = render(<Profile />);

    expect(screen.getByRole("button", { name: "프로필 이미지 선택" })).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("showIconButton이 false이면 아이콘 버튼과 파일 input이 렌더되지 않는다", () => {
    const { container } = render(<Profile showIconButton={false} />);

    expect(screen.queryByRole("button", { name: "프로필 이미지 선택" })).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument();
  });

  it("아이콘 버튼을 클릭하면 숨겨진 파일 input의 클릭이 트리거된다", async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
    const user = userEvent.setup();
    render(<Profile />);

    await user.click(screen.getByRole("button", { name: "프로필 이미지 선택" }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("유효한 이미지 파일을 선택하면 미리보기 URL로 이미지가 교체 렌더된다", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container } = render(<Profile />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(await screen.findByAltText("프로필 이미지")).toHaveAttribute("src", "blob:mock-url");
  });

  it("유효한 이미지 파일을 선택하면 onImageChange가 해당 파일로 호출된다", async () => {
    const handleChange = vi.fn();
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container } = render(<Profile onImageChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it("allowedTypes에 없는 파일 형식을 선택하면 onImageChange 대신 에러 토스트가 표시된다", async () => {
    const handleChange = vi.fn();
    const file = new File(["dummy"], "photo.gif", { type: "image/gif" });
    const { container } = render(
      <Profile onImageChange={handleChange} allowedTypes={["image/png", "image/webp"]} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(handleChange).not.toHaveBeenCalled();
    expect(await screen.findByText("png, webp 파일만 올릴 수 있어요")).toBeInTheDocument();
  });

  it("maxSizeBytes를 초과하는 파일을 선택하면 onImageChange 대신 에러 토스트가 표시된다", async () => {
    const handleChange = vi.fn();
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });
    const { container } = render(
      <Profile onImageChange={handleChange} maxSizeBytes={5 * 1024 * 1024} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(handleChange).not.toHaveBeenCalled();
    expect(await screen.findByText("5MB 이하의 파일만 올릴 수 있어요")).toBeInTheDocument();
  });

  it("이전 선택의 디코딩이 늦게 끝나도 나중에 고른 파일만 onImageChange에 반영된다", async () => {
    let resolveFirstDecode: (bitmap: { close: () => void }) => void = () => {};
    mockCreateImageBitmap
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveFirstDecode = resolve;
          }),
      )
      .mockImplementationOnce(() => Promise.resolve({ close: vi.fn() }));

    const handleChange = vi.fn();
    const fileA = new File(["a"], "a.png", { type: "image/png" });
    const fileB = new File(["b"], "b.png", { type: "image/png" });
    const { container } = render(<Profile onImageChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, fileA);
    await userEvent.upload(input, fileB);
    await waitFor(() => expect(handleChange).toHaveBeenCalledWith(fileB));

    resolveFirstDecode({ close: vi.fn() });
    await Promise.resolve();

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("선택한 파일이 이미지로 디코딩되지 않으면 onImageChange 대신 에러 토스트가 표시된다", async () => {
    mockCreateImageBitmap.mockRejectedValueOnce(new Error("decode failed"));
    const handleChange = vi.fn();
    // 확장자·MIME은 이미지이지만 내용이 손상된 파일(디코딩 실패) 시나리오
    const file = new File(["corrupted"], "broken.png", { type: "image/png" });
    const { container } = render(<Profile onImageChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(handleChange).not.toHaveBeenCalled();
    expect(
      await screen.findByText("이미지를 불러올 수 없어요. 다른 파일을 선택해주세요"),
    ).toBeInTheDocument();
  });

  it("파일 input에서 파일을 선택하지 않으면 onImageChange가 호출되지 않는다", () => {
    const handleChange = vi.fn();
    const { container } = render(<Profile onImageChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("로컬 미리보기를 선택한 뒤 부모가 새 imageUrl을 내려주면 미리보기가 리셋되고 새 URL이 보인다", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container, rerender } = render(<Profile />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);
    expect(await screen.findByAltText("프로필 이미지")).toHaveAttribute("src", "blob:mock-url");

    rerender(<Profile imageUrl="https://example.com/server.png" />);

    expect(await screen.findByAltText("프로필 이미지")).toHaveAttribute(
      "src",
      "https://example.com/server.png",
    );
  });

  it("이미지 로드가 실패하면 기본 아바타로 대체된다", async () => {
    const { container } = render(
      <Profile imageUrl="https://example.com/broken.png" showIconButton={false} />,
    );
    const img = await screen.findByAltText("프로필 이미지");

    fireEvent.error(img);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("컴포넌트가 unmount되면 생성된 미리보기 URL이 revokeObjectURL로 해제된다", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container, unmount } = render(<Profile />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);
    await screen.findByAltText("프로필 이미지");
    unmount();

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
