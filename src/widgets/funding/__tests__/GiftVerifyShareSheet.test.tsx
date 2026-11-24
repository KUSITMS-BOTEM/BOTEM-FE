import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useShareLink } from "@/hooks/useShareLink";
import type {
  OwnerFundingDetailResponse,
  OwnerFundingParticipantResponse,
} from "@/types/funding/ownerFundingDetail";
import GiftVerifyShareSheet from "@/widgets/funding/GiftVerifyShareSheet";

vi.mock("@/hooks/queries/funding/useFundingManagementQuery");
vi.mock("@/hooks/useShareLink");

const share = vi.fn();
const refetch = vi.fn();

const participant = (
  overrides: Partial<OwnerFundingParticipantResponse>,
): OwnerFundingParticipantResponse => ({
  contributionId: 1,
  order: 1,
  name: "이동현",
  profileImageUrl: null,
  status: "CONFIRMED",
  participatedAt: "2026-10-09T10:00:00",
  thankCardSent: false,
  thankCardSentAt: null,
  ...overrides,
});

const detail = (participants: OwnerFundingParticipantResponse[]): OwnerFundingDetailResponse => ({
  fundingId: 12,
  shareKey: "abc123",
  type: "BIRTHDAY",
  title: null,
  celebrantName: "세윤",
  story: null,
  promise: null,
  product: { name: "에어팟", imageUrl: "/airpods.png", price: 300000, url: "https://botem.me" },
  productChanged: false,
  productChangedAt: null,
  targetAmount: 300000,
  deadline: "2026-10-20T23:59:59",
  revealAt: null,
  remainingDays: null,
  confirmedPercentage: 100,
  pendingPercentage: 0,
  pendingContributionCount: 0,
  targetReached: true,
  extended: false,
  earlyClosedAt: null,
  giftPreparedAt: null,
  participantCount: participants.length,
  participants,
  messageCount: 0,
  managementState: "CLOSED",
  actions: {
    canCloseEarly: false,
    canExtend: false,
    canChangeProduct: false,
    canReissueShareCard: false,
  },
});

const mockQuery = (state: { data?: OwnerFundingDetailResponse; isError?: boolean }) => {
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: state.data,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
};

const onClose = vi.fn();
const onShared = vi.fn();
const renderSheet = (open = true) =>
  render(<GiftVerifyShareSheet open={open} fundingId={12} onClose={onClose} onShared={onShared} />);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useShareLink).mockReturnValue({
    toast: null,
    share,
    copyLink: vi.fn(),
  });
});

describe("GiftVerifyShareSheet", () => {
  it("함께한 친구 수와 친구별 이름·보탠 날짜를 보여주고, 여러 번 보탠 친구는 한 줄로 보여준다", () => {
    mockQuery({
      data: detail([
        participant({ contributionId: 1, order: 1, name: "이동현" }),
        participant({ contributionId: 2, order: 1, name: "이동현" }),
        participant({
          contributionId: 3,
          order: 2,
          name: "김민지",
          participatedAt: "2026-10-12T18:30:00",
        }),
      ]),
    });

    renderSheet();

    expect(screen.getByText("함께한 친구 2명")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("10월 9일 보탬")).toBeInTheDocument();
    expect(screen.getByText("김민지")).toBeInTheDocument();
    expect(screen.getByText("10월 12일 보탬")).toBeInTheDocument();
  });

  it("'친구에게 공유하기'를 누르면 shareKey로 만든 인증 결과 링크를 공유한다", async () => {
    mockQuery({ data: detail([participant({})]) });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));

    expect(share).toHaveBeenCalledWith({
      title: "선물 도착 인증이 왔어요",
      url: `${window.location.origin}/share/abc123/gift`,
    });
  });

  it("기기 공유창으로 보내면 onShared를 호출한다", async () => {
    share.mockResolvedValue(true);
    mockQuery({ data: detail([participant({})]) });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));

    expect(onShared).toHaveBeenCalledTimes(1);
  });

  it("공유창을 닫았거나 링크 복사로 넘어가면 onShared를 호출하지 않는다", async () => {
    share.mockResolvedValue(false);
    mockQuery({ data: detail([participant({})]) });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "친구에게 공유하기" }));

    expect(onShared).not.toHaveBeenCalled();
  });

  it("불러오는 중에는 스켈레톤을 보여주고 공유 버튼을 막는다", () => {
    mockQuery({});

    renderSheet();

    expect(screen.getByRole("status", { name: "함께한 친구를 불러오는 중" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "친구에게 공유하기" })).toBeDisabled();
  });

  it("불러오지 못하면 '다시 시도'로 재요청한다", async () => {
    mockQuery({ isError: true });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("함께한 친구가 없으면 안내 문구를 보여준다", () => {
    mockQuery({ data: detail([]) });

    renderSheet();

    expect(screen.getByText("함께한 친구가 없어요")).toBeInTheDocument();
  });

  it("시트가 닫혀 있으면 함께한 친구를 조회하지 않는다", () => {
    mockQuery({});

    renderSheet(false);

    expect(useFundingManagementQuery).toHaveBeenCalledWith(12, { enabled: false });
  });

  it("닫으면 받아 온 shareKey를 넘긴다", async () => {
    mockQuery({ data: detail([participant({})]) });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledWith("abc123");
  });
});
