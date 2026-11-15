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
    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => "blob:preview");
      URL.revokeObjectURL = vi.fn();
    });

    it("사진이 없으면 120px 점선 슬롯과 플러스 아이콘을 보여준다", () => {
      render(<AssetSlot type="photo" />);

      const button = screen.getByRole("button", { name: "사진 선택" });
      expect(button).toHaveClass("size-[120px]", "border-dashed");
      expect(screen.queryByAltText("선택한 사진")).not.toBeInTheDocument();
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
  });
});
