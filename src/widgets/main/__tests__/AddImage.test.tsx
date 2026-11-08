import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddImage from "@/widgets/main/AddImage";

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

// jsdom에는 URL.createObjectURL/revokeObjectURL이 구현되어 있지 않아 직접 모킹한다.
beforeAll(() => {
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddImage", () => {
  it("상품 이미지 라벨 텍스트가 렌더된다", () => {
    render(<AddImage value={null} onChange={vi.fn()} />);

    expect(screen.getByText("상품 이미지")).toBeInTheDocument();
  });

  it("value가 null이면 plus 아이콘이 보이고 이미지 미리보기는 렌더되지 않는다", () => {
    const { container } = render(<AddImage value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "상품 이미지 선택" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("value에 File이 주어지면 URL.createObjectURL이 해당 파일로 호출되고 반환된 URL로 미리보기가 렌더된다", () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container } = render(<AddImage value={file} onChange={vi.fn()} />);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    expect(container.querySelector("img")).toHaveAttribute("src", "blob:mock-url");
  });

  it("버튼을 클릭하면 숨겨진 파일 input의 클릭이 트리거된다", async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
    const user = userEvent.setup();
    render(<AddImage value={null} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "상품 이미지 선택" }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it("파일 input에서 파일을 선택하면 onChange가 선택된 파일로 호출된다", async () => {
    const handleChange = vi.fn();
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { container } = render(<AddImage value={null} onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(handleChange).toHaveBeenCalledWith(file);
  });

  it("파일 input에서 파일을 선택하지 않으면 onChange가 호출되지 않는다", () => {
    const handleChange = vi.fn();
    const { container } = render(<AddImage value={null} onChange={handleChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("컴포넌트가 unmount되면 생성된 미리보기 URL이 revokeObjectURL로 해제된다", () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const { unmount } = render(<AddImage value={file} onChange={vi.fn()} />);

    unmount();

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
