import { fireEvent, render, screen } from "@testing-library/react";

import BotemPopup, { type BotemPopupFriend } from "@/widgets/funding/BotemPopup";

const FRIENDS: BotemPopupFriend[] = [
  { id: 1, name: "이동현", contributedAt: "2026-10-13T09:30:00" },
  { id: 2, name: "김민영", contributedAt: "2026-10-10T23:59:00" },
];

const renderPopup = (props: Partial<React.ComponentProps<typeof BotemPopup>> = {}) => {
  const handlers = {
    onClose: vi.fn(),
    onUnconfirmedClick: vi.fn(),
    onEditClick: vi.fn(),
    onMessageClick: vi.fn(),
    onContributeClick: vi.fn(),
  };
  render(
    <BotemPopup
      open
      unconfirmedCount={3}
      friends={FRIENDS}
      ownerName="지유"
      isClosed={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe("BotemPopup 미확인 행", () => {
  it("미확인이 있으면 개수와 확인 안내 문구를 보여주고, 클릭하면 onUnconfirmedClick이 호출된다", () => {
    const { onUnconfirmedClick } = renderPopup();

    expect(screen.getByText("내 보탬 · 미확인 3개")).toBeInTheDocument();
    expect(screen.getByText("지유가 못 받은거 같아요. 확인해 볼까요?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /미확인 3개/ }));
    expect(onUnconfirmedClick).toHaveBeenCalledTimes(1);
  });

  it("개설자 이름의 받침에 따라 조사가 바뀐다", () => {
    renderPopup({ ownerName: "민준" });

    expect(screen.getByText("민준이 못 받은거 같아요. 확인해 볼까요?")).toBeInTheDocument();
  });

  it("미확인이 0개면 전부 확인했다는 문구를 보여주고 클릭할 수 없다", () => {
    renderPopup({ unconfirmedCount: 0 });

    expect(screen.getByText("내 보탬 · 미확인 0개")).toBeInTheDocument();
    expect(screen.getByText("지유가 전부 확인했어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /미확인/ })).not.toBeInTheDocument();
  });
});

describe("BotemPopup 마감 상태", () => {
  it("마감 전이면 수정 행과 하단 버튼이 동작한다", () => {
    const { onEditClick, onMessageClick, onContributeClick } = renderPopup();

    fireEvent.click(screen.getByRole("button", { name: /내 보탬 수정하기/ }));
    fireEvent.click(screen.getByRole("button", { name: "메세지 보태기" }));
    fireEvent.click(screen.getByRole("button", { name: "보태기" }));

    expect(onEditClick).toHaveBeenCalledTimes(1);
    expect(onMessageClick).toHaveBeenCalledTimes(1);
    expect(onContributeClick).toHaveBeenCalledTimes(1);
  });

  it("마감됐으면 수정 행을 숨기고 보태기만 비활성화하며 메세지 보태기는 동작한다", () => {
    const { onMessageClick } = renderPopup({ isClosed: true });

    expect(screen.queryByText("내 보탬 수정하기")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "메세지 보태기" }));
    expect(onMessageClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "보태기" })).toBeDisabled();
  });
});

describe("BotemPopup 친구 목록", () => {
  it("친구 수와 이름을 보여주고 날짜를 2026.10.13 형식으로 바꾼다", () => {
    renderPopup();

    expect(screen.getByText("보태준 친구들 2명")).toBeInTheDocument();
    expect(screen.getByText("이동현")).toBeInTheDocument();
    expect(screen.getByText("김민영")).toBeInTheDocument();
    expect(screen.getByText("2026.10.13")).toBeInTheDocument();
    expect(screen.getByText("2026.10.10")).toBeInTheDocument();
  });

  it("날짜로 해석할 수 없는 값은 날짜를 비우고 이름은 그대로 보여준다", () => {
    renderPopup({ friends: [{ id: 1, name: "이동현", contributedAt: "잘못된 값" }] });

    expect(screen.getByText("이동현")).toBeInTheDocument();
    expect(screen.queryByText(/\d{4}\.\d{2}\.\d{2}/)).not.toBeInTheDocument();
  });

  it("친구가 없으면 빈 상태 문구를 보여준다", () => {
    renderPopup({ friends: [] });

    expect(screen.getByText("보태준 친구들 0명")).toBeInTheDocument();
    expect(screen.getByText("아직 보태준 친구가 없어요")).toBeInTheDocument();
  });
});

describe("BotemPopup 닫기", () => {
  it("닫기 버튼을 누르면 onClose가 호출된다", () => {
    const { onClose } = renderPopup();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Esc(cancel)로 브라우저가 닫지 못하게 막고 onClose를 호출한다", () => {
    const { onClose } = renderPopup();

    const notPrevented = fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );

    expect(notPrevented).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("딤(다이얼로그 바깥) 클릭은 onClose를 호출하지만 안쪽 콘텐츠 클릭은 호출하지 않는다", () => {
    const { onClose } = renderPopup();

    fireEvent.click(screen.getByText("이동현"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("BotemPopup 열림 상태", () => {
  it("open이 바뀌면 다이얼로그를 열고 닫는다", () => {
    const props = {
      unconfirmedCount: 0,
      friends: FRIENDS,
      ownerName: "지유",
      isClosed: false,
      onClose: vi.fn(),
      onUnconfirmedClick: vi.fn(),
      onEditClick: vi.fn(),
      onMessageClick: vi.fn(),
      onContributeClick: vi.fn(),
    };
    const { container, rerender } = render(<BotemPopup {...props} open={false} />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");

    rerender(<BotemPopup {...props} open />);
    expect(dialog).toHaveAttribute("open");

    rerender(<BotemPopup {...props} open={false} />);
    expect(dialog).not.toHaveAttribute("open");
  });
});
