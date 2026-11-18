import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StickerSheet from "@/widgets/letter-paper/StickerSheet";
import { STICKERS } from "@/widgets/letter-paper/stickers";

function renderSheet(props: Partial<React.ComponentProps<typeof StickerSheet>> = {}) {
  return render(
    <StickerSheet
      stickers={STICKERS}
      selectedId={null}
      onSelect={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe("StickerSheet", () => {
  it("안내 문구와 스티커 8개를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("아이콘을 편지지에 붙여보세요")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });

  it("스티커를 누르면 해당 스티커로 onSelect가 호출된다", async () => {
    const onSelect = vi.fn();
    renderSheet({ onSelect });

    await userEvent.click(screen.getByRole("button", { name: "스티커 3" }));

    expect(onSelect).toHaveBeenCalledWith(STICKERS[2]);
  });

  it("선택된 스티커만 pressed 상태이다", () => {
    renderSheet({ selectedId: STICKERS[1].id });

    expect(screen.getByRole("button", { name: "스티커 2" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "스티커 1" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("마우스로 목록을 끌면 스티커가 선택되지 않고 단순 클릭은 선택된다", () => {
    const onSelect = vi.fn();
    renderSheet({ onSelect });
    const sticker = screen.getByRole("button", { name: "스티커 1" });

    fireEvent.pointerDown(sticker, { pointerType: "mouse", clientX: 0 });
    fireEvent.pointerMove(sticker, { pointerType: "mouse", clientX: 30 });
    fireEvent.pointerUp(sticker, { pointerType: "mouse", clientX: 30 });
    fireEvent.click(sticker);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(sticker);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("닫기 버튼을 누르면 onClose가 호출된다", async () => {
    const onClose = vi.fn();
    renderSheet({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
