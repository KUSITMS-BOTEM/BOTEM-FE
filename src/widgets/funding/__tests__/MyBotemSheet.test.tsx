import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MyBotemSheet, { type MyBotemSheetFriend } from "@/widgets/funding/MyBotemSheet";

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const FRIENDS: MyBotemSheetFriend[] = [
  { id: 1, name: "김민영", contributedAt: "2026-10-10T09:00:00" },
  { id: 2, name: "이동현", contributedAt: "2026-10-13T09:00:00", isMine: true, isConfirmed: false },
  { id: 3, name: "박준희", contributedAt: "2026-10-06T09:00:00" },
];

const renderSheet = (props: Partial<React.ComponentProps<typeof MyBotemSheet>> = {}) => {
  const handlers = { onClose: vi.fn(), onEditClick: vi.fn() };
  render(
    <MyBotemSheet
      open
      unconfirmedCount={1}
      friends={FRIENDS}
      ownerName="지유"
      isClosed={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe("MyBotemSheet", () => {
  it("내 보탬이 목록 맨 위에 '내 보탬' 라벨과 함께 오고 나머지는 원래 순서를 지킨다", () => {
    renderSheet();

    const items = screen.getAllByRole("listitem");
    expect(items.map(item => within(item).getByText(/김민영|이동현|박준희/).textContent)).toEqual([
      "이동현",
      "김민영",
      "박준희",
    ]);
    expect(within(items[0]).getByText("내 보탬")).toBeInTheDocument();
    expect(screen.getAllByText("내 보탬")).toHaveLength(1);
  });

  it("내 보탬을 개설자가 아직 확인하지 않았으면 안내 문구를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("아직 확인하지 않았어요")).toBeInTheDocument();
  });

  it("내 보탬을 확인했으면 안내 문구를 보여주지 않는다", () => {
    renderSheet({
      friends: [
        {
          id: 2,
          name: "이동현",
          contributedAt: "2026-10-13T09:00:00",
          isMine: true,
          isConfirmed: true,
        },
      ],
    });

    expect(screen.queryByText("아직 확인하지 않았어요")).not.toBeInTheDocument();
  });

  it("내 보탬이 없으면 '내 보탬' 라벨을 보여주지 않는다", () => {
    renderSheet({ friends: [FRIENDS[0]] });

    expect(screen.queryByText("내 보탬", { selector: "span" })).not.toBeInTheDocument();
  });

  it("보태준 친구가 없으면 빈 상태 문구를 보여준다", () => {
    renderSheet({ friends: [] });

    expect(screen.getByText("보태준 친구들 0명")).toBeInTheDocument();
    expect(screen.getByText("아직 보태준 친구가 없어요")).toBeInTheDocument();
  });

  it("미확인 건수가 있으면 개수와 안내 문구를, 없으면 전부 확인했다는 문구를 보여준다", () => {
    const { unmount } = render(
      <MyBotemSheet
        open
        unconfirmedCount={2}
        friends={FRIENDS}
        ownerName="지유"
        isClosed={false}
        onClose={vi.fn()}
        onEditClick={vi.fn()}
      />,
    );
    expect(screen.getByText("내 보탬 · 미확인 2개")).toBeInTheDocument();
    unmount();

    renderSheet({ unconfirmedCount: 0 });
    expect(screen.getByText("지유가 전부 확인했어요")).toBeInTheDocument();
  });

  it("'내 보탬 수정하기'를 누르면 onEditClick이 호출된다", async () => {
    const { onEditClick } = renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /내 보탬 수정하기/ }));

    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it("마감된 펀딩에서는 '내 보탬 수정하기' 행이 없다", () => {
    renderSheet({ isClosed: true });

    expect(screen.queryByText("내 보탬 수정하기")).not.toBeInTheDocument();
  });

  it("하단에 '메세지 보태기'·'보태기' 버튼이 없고 닫기 버튼으로 onClose를 부른다", async () => {
    const { onClose } = renderSheet();

    expect(screen.queryByRole("button", { name: "보태기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메세지 보태기" })).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "닫기" }).at(-1)!);
    expect(onClose).toHaveBeenCalled();
  });
});
