import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendFundingResponse, FriendProfileResponse } from "@/types/friend/friend";
import FriendProfileContainer from "@/widgets/friend/FriendProfileContainer";

const back = vi.fn();
const refetch = vi.fn();
const useFriendProfileQuery = vi.fn();

vi.mock("@/hooks/mutations/funding/useCreateSurpriseFundingMutation", () => ({
  useCreateSurpriseFundingMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));
vi.mock("@/hooks/queries/friend/useFriendProfileQuery", () => ({
  useFriendProfileQuery: (friendId: string) => useFriendProfileQuery(friendId),
}));

const funding: FriendFundingResponse = {
  fundingId: 1,
  type: "BIRTHDAY",
  productName: "소니 WH-1000 XM4",
  productImageUrl: null,
  deadline: "2026-10-13T23:59:59.999999",
  remainingDays: 7,
  participantCount: 2,
  firstParticipantName: "민지",
  confirmedPercentage: 50,
};

const profile = (overrides: Partial<FriendProfileResponse> = {}): FriendProfileResponse => ({
  userId: 5,
  name: "지유",
  profileImageUrl: null,
  birthday: "10-24",
  birthdayDday: 3,
  fundings: [funding],
  wishes: [
    {
      wishId: 1,
      productName: "모자",
      productImageUrl: null,
      price: 429000,
    },
  ],
  wishesVisible: true,
  wishCount: 1,
  ...overrides,
});

const mockQuery = (state: { data?: FriendProfileResponse | null; isPending?: boolean }) =>
  useFriendProfileQuery.mockReturnValue({ data: undefined, isPending: false, refetch, ...state });

describe("FriendProfileContainer", () => {
  beforeEach(() => {
    back.mockClear();
    refetch.mockClear();
  });

  it("route의 friendId로 친구 프로필을 조회한다", () => {
    mockQuery({ data: profile() });
    render(<FriendProfileContainer friendId="5" />);

    expect(useFriendProfileQuery).toHaveBeenCalledWith("5");
  });

  it("불러오는 중이면 스켈레톤을 보여준다", () => {
    mockQuery({ isPending: true });
    render(<FriendProfileContainer friendId="5" />);

    expect(screen.getByLabelText("친구 프로필 불러오는 중")).toBeInTheDocument();
    expect(screen.getByText("친구 프로필")).toBeInTheDocument();
  });

  it("조회에 실패하면 안내 문구를 보여주고 다시 시도하면 refetch를 호출한다", async () => {
    mockQuery({ data: undefined });
    render(<FriendProfileContainer friendId="5" />);

    expect(screen.getByText("친구 프로필을 불러오지 못했어요.")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("헤더에 '{이름} 프로필'을, 본문에 이름·생일·D-day를 보여준다", () => {
    mockQuery({ data: profile() });
    render(<FriendProfileContainer friendId="5" />);

    expect(screen.getByText("지유 프로필")).toBeInTheDocument();
    expect(screen.getByText("지유")).toBeInTheDocument();
    expect(screen.getByText("생일 10월 24일")).toBeInTheDocument();
    expect(screen.getByText("생일까지 3일 남았어요")).toBeInTheDocument();
  });

  it.each([
    ["펀딩 O · 위시 O", [funding], 1, true, false],
    ["펀딩 O · 위시 X", [funding], 0, true, true],
    ["펀딩 X · 위시 O", [], 1, false, false],
    ["펀딩 X · 위시 X", [], 0, false, true],
  ] as const)(
    "%s 케이스에 맞게 섹션을 보여준다",
    (_, fundings, wishCount, showsFunding, showsEmpty) => {
      mockQuery({
        data: profile({
          fundings: [...fundings],
          wishes: profile().wishes.slice(0, wishCount),
        }),
      });
      render(<FriendProfileContainer friendId="5" />);

      expect(screen.queryByRole("heading", { name: /진행중인 펀딩/ }) !== null).toBe(showsFunding);
      expect(screen.getByRole("heading", { name: `위시 ${wishCount}개` })).toBeInTheDocument();
      expect(screen.queryByText(/아직 위시가 없어요/) !== null).toBe(showsEmpty);
    },
  );

  it("서프라이즈 열기 → 위시 선택하기를 누르면 그 위시로 펀딩 정보 단계가 열린다", async () => {
    mockQuery({ data: profile() });
    const user = userEvent.setup();
    render(<FriendProfileContainer friendId="5" />);

    await user.click(screen.getByRole("button", { name: /서프라이즈 열기/ }));
    await user.click(await screen.findByRole("button", { name: "모자 선택하기" }));

    expect(await screen.findByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
  });

  it("뒤로가기 버튼을 누르면 router.back을 호출한다", async () => {
    mockQuery({ data: profile() });
    render(<FriendProfileContainer friendId="5" />);

    await userEvent.setup().click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalledTimes(1);
  });
});
