import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useSurpriseThankCardFriendsQuery } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
import type { SurpriseThankCardFriend } from "@/types/funding/surprise";
import SurpriseThankFriendsSheet from "@/widgets/funding/SurpriseThankFriendsSheet";

vi.mock("@/hooks/queries/funding/useSurpriseThankCardFriendsQuery", () => ({
  useSurpriseThankCardFriendsQuery: vi.fn(),
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

const refetch = vi.fn();

const makeFriend = (overrides: Partial<SurpriseThankCardFriend> = {}): SurpriseThankCardFriend => ({
  contributionId: 1,
  name: "서연",
  profileImageUrl: null,
  organizer: false,
  messageTypes: ["TEXT"],
  contributedDate: "2026-10-03",
  thankCardSent: false,
  ...overrides,
});

const mockQuery = (state: { friends?: SurpriseThankCardFriend[]; isError?: boolean }) => {
  vi.mocked(useSurpriseThankCardFriendsQuery).mockReturnValue({
    data: state.friends ? { fundingId: 9, friends: state.friends } : undefined,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof useSurpriseThankCardFriendsQuery>);
};

const renderSheet = (props: Partial<React.ComponentProps<typeof SurpriseThankFriendsSheet>> = {}) =>
  render(
    <SurpriseThankFriendsSheet
      open
      fundingId={9}
      onClose={vi.fn()}
      onThankCardClick={vi.fn()}
      {...props}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SurpriseThankFriendsSheet", () => {
  it("닫혀 있으면 친구 목록을 조회하지 않도록 enabled를 false로 넘긴다", () => {
    mockQuery({});

    renderSheet({ open: false });

    expect(useSurpriseThankCardFriendsQuery).toHaveBeenCalledWith(9, false);
  });

  it("열려 있으면 친구 목록 조회를 켠다", () => {
    mockQuery({ friends: [] });

    renderSheet({ open: true });

    expect(useSurpriseThankCardFriendsQuery).toHaveBeenCalledWith(9, true);
  });

  it("친구 목록과 함께한 인원수를 보여준다", () => {
    mockQuery({
      friends: [makeFriend(), makeFriend({ contributionId: 2, name: "도윤" })],
    });

    renderSheet();

    expect(screen.getByText("함께한 친구 2명")).toBeInTheDocument();
    expect(screen.getByText("서연")).toBeInTheDocument();
    expect(screen.getByText("도윤")).toBeInTheDocument();
    expect(screen.getAllByText("10월 3일 보탬")).toHaveLength(2);
  });

  it("프로필 이미지가 있으면 보여주고, 없거나 올바르지 않으면 기본 이미지를 보여준다", () => {
    mockQuery({
      friends: [
        makeFriend({ profileImageUrl: "https://example.com/p.png" }),
        makeFriend({ contributionId: 2, name: "도윤", profileImageUrl: null }),
        makeFriend({ contributionId: 3, name: "예린", profileImageUrl: "javascript:alert(1)" }),
      ],
    });
    const { container } = renderSheet();

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute("src")).toContain("example.com");
  });

  it("준비한 친구(organizer)는 이름 뒤에 '(준비한 친구)'를 붙인다", () => {
    mockQuery({ friends: [makeFriend({ name: "민준", organizer: true })] });

    renderSheet();

    expect(screen.getByText("민준 (준비한 친구)")).toBeInTheDocument();
  });

  it("감사카드를 이미 보낸 친구는 '보냈어요'만 보이고 보내기 버튼이 없다", () => {
    mockQuery({ friends: [makeFriend({ thankCardSent: true })] });

    renderSheet();

    expect(screen.getByText("보냈어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /감사카드 보내기/ })).not.toBeInTheDocument();
  });

  it("감사카드 보내기를 누르면 그 친구로 onThankCardClick을 호출한다", async () => {
    const friend = makeFriend({ contributionId: 3, name: "하린" });
    const onThankCardClick = vi.fn();
    mockQuery({ friends: [friend] });
    renderSheet({ onThankCardClick });

    await userEvent.click(screen.getByRole("button", { name: "하린에게 감사카드 보내기" }));

    expect(onThankCardClick).toHaveBeenCalledWith(friend);
  });

  it("친구가 없으면 빈 목록 안내와 0명을 보여준다", () => {
    mockQuery({ friends: [] });

    renderSheet();

    expect(screen.getByText("함께한 친구가 없어요")).toBeInTheDocument();
    expect(screen.getByText("함께한 친구 0명")).toBeInTheDocument();
  });

  it("조회에 실패하면 안내와 함께 다시 시도할 수 있다", async () => {
    mockQuery({ isError: true });
    renderSheet();

    expect(screen.getByText("함께한 친구를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("조회 중에는 스켈레톤을 보이고 인원수와 목록은 없다", () => {
    mockQuery({});

    renderSheet();

    expect(screen.getByRole("status", { name: "함께한 친구를 불러오는 중" })).toBeInTheDocument();
    expect(screen.queryByText(/명$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
