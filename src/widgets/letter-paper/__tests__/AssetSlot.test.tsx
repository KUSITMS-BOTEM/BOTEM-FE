import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AssetSlot from "@/widgets/letter-paper/AssetSlot";

describe("AssetSlot", () => {
  describe("type=icon", () => {
    it("asset이 없으면 점선 테두리와 플러스 아이콘을 보여준다", () => {
      render(<AssetSlot type="icon" />);

      const button = screen.getByRole("button", { name: "아이콘 선택" });
      expect(button).toHaveClass("size-[50px]", "border", "border-dashed");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("asset이 있으면 테두리를 없애고 asset만 보여준다", () => {
      render(<AssetSlot type="icon" asset={<span data-testid="asset" />} />);

      const button = screen.getByRole("button", { name: "아이콘 선택" });
      expect(screen.getByTestId("asset")).toBeInTheDocument();
      expect(button).not.toHaveClass("border");
      expect(button.querySelector("svg")).not.toBeInTheDocument();
    });

    it("클릭하면 onClick이 호출된다", async () => {
      const onClick = vi.fn();
      render(<AssetSlot type="icon" onClick={onClick} />);

      await userEvent.click(screen.getByRole("button", { name: "아이콘 선택" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("type=photo", () => {
    let urlCount = 0;
    const uploadInto = (container: HTMLElement, file: File) =>
      userEvent.upload(container.querySelector("input[type=file]")!, file);

    beforeEach(() => {
      urlCount = 0;
      URL.createObjectURL = vi.fn(() => `blob:preview-${++urlCount}`);
      URL.revokeObjectURL = vi.fn();
      global.createImageBitmap = vi
        .fn()
        .mockResolvedValue({ close: vi.fn() }) as unknown as typeof createImageBitmap;
    });

    it("사진이 없으면 120px 점선 슬롯과 플러스 아이콘을 보여준다", () => {
      render(<AssetSlot type="photo" />);

      const button = screen.getByRole("button", { name: "사진 선택" });
      expect(button).toHaveClass("size-[120px]", "border-dashed");
      expect(screen.queryByAltText("선택한 사진")).not.toBeInTheDocument();
    });

    it("src가 있으면 선택 없이도 사진을 보여주고 테두리를 없앤다", () => {
      render(<AssetSlot type="photo" src="/cat.jpg" />);

      expect(screen.getByAltText("선택한 사진")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "사진 선택" })).not.toHaveClass("border-dashed");
    });

    it("사진을 선택하면 미리보기를 보여주고 테두리를 없애며 onImageChange를 호출한다", async () => {
      const onImageChange = vi.fn();
      const { container } = render(<AssetSlot type="photo" onImageChange={onImageChange} />);
      const file = new File(["x"], "a.png", { type: "image/png" });

      await userEvent.upload(container.querySelector("input[type=file]")!, file);

      await waitFor(() => expect(screen.getByAltText("선택한 사진")).toBeInTheDocument());
      expect(screen.getByRole("button", { name: "사진 선택" })).not.toHaveClass("border");
      expect(onImageChange).toHaveBeenCalledWith(file);
    });

    it("사진을 선택한 뒤에도 다시 눌러 파일 선택창을 열 수 있다", async () => {
      const { container } = render(<AssetSlot type="photo" />);
      const input = container.querySelector("input[type=file]") as HTMLInputElement;
      await userEvent.upload(input, new File(["x"], "a.png", { type: "image/png" }));
      const clickSpy = vi.spyOn(input, "click");

      await userEvent.click(screen.getByRole("button", { name: "사진 선택" }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it("사진을 교체하면 이전 미리보기 URL을 해제한다", async () => {
      const { container } = render(<AssetSlot type="photo" />);

      await uploadInto(container, new File(["x"], "a.png", { type: "image/png" }));
      await waitFor(() => expect(screen.getByAltText("선택한 사진")).toBeInTheDocument());
      await uploadInto(container, new File(["y"], "b.png", { type: "image/png" }));

      await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1"));
      expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:preview-2");
    });

    it("언마운트하면 마지막 미리보기 URL을 해제한다", async () => {
      const { container, unmount } = render(<AssetSlot type="photo" />);
      await uploadInto(container, new File(["x"], "a.png", { type: "image/png" }));
      await waitFor(() => expect(screen.getByAltText("선택한 사진")).toBeInTheDocument());

      unmount();

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
    });

    it("allowedTypes에 없는 형식이면 onImageChange 없이 에러 토스트를 보여준다", async () => {
      const onImageChange = vi.fn();
      const { container } = render(
        <AssetSlot type="photo" allowedTypes={["image/png"]} onImageChange={onImageChange} />,
      );

      await uploadInto(container, new File(["x"], "a.gif", { type: "image/gif" }));

      expect(await screen.findByText("png 파일만 올릴 수 있어요")).toBeInTheDocument();
      expect(onImageChange).not.toHaveBeenCalled();
      expect(screen.queryByAltText("선택한 사진")).not.toBeInTheDocument();
    });

    it("maxSizeBytes를 넘으면 onImageChange 없이 에러 토스트를 보여준다", async () => {
      const onImageChange = vi.fn();
      const { container } = render(
        <AssetSlot type="photo" maxSizeBytes={1024 * 1024} onImageChange={onImageChange} />,
      );
      const big = new File([new Uint8Array(2 * 1024 * 1024)], "big.png", { type: "image/png" });

      await uploadInto(container, big);

      expect(await screen.findByText("1MB 이하의 파일만 올릴 수 있어요")).toBeInTheDocument();
      expect(onImageChange).not.toHaveBeenCalled();
    });

    it("디코딩할 수 없는 파일이면 onImageChange 없이 에러 토스트를 보여준다", async () => {
      global.createImageBitmap = vi
        .fn()
        .mockRejectedValue(new Error("decode")) as unknown as typeof createImageBitmap;
      const onImageChange = vi.fn();
      const { container } = render(<AssetSlot type="photo" onImageChange={onImageChange} />);

      await uploadInto(container, new File(["x"], "a.png", { type: "image/png" }));

      expect(await screen.findByText(/이미지를 불러올 수 없어요/)).toBeInTheDocument();
      expect(onImageChange).not.toHaveBeenCalled();
    });
  });
});
