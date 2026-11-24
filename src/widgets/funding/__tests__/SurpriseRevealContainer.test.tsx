import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useOpenSurpriseMutation } from "@/hooks/mutations/funding/useOpenSurpriseMutation";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { useSurpriseThankCardFriendsQuery } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
import { ApiError } from "@/types/api";
import type {
  SurpriseMessage,
  SurpriseRevealResponse,
  SurpriseThankCardFriend,
} from "@/types/funding/surprise";
import SurpriseRevealContainer from "@/widgets/funding/SurpriseRevealContainer";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));
vi.mock("@/hooks/queries/funding/useSurpriseRevealQuery", () => ({
  useSurpriseRevealQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useOpenSurpriseMutation", () => ({
  useOpenSurpriseMutation: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useSurpriseThankCardFriendsQuery", () => ({
  useSurpriseThankCardFriendsQuery: vi.fn(),
}));
vi.mock("@/components/effects/RevealMotion", () => ({
  default: ({ names }: { names: string[] }) => (
    <div data-testid="reveal-motion">{names.join(",")}</div>
  ),
}));
vi.mock("@/widgets/rolling-paper/RollingPaperContainer", () => ({
  default: ({ open, ctaButtons }: { open: boolean; ctaButtons?: React.ReactNode }) =>
    open ? (
      <div role="dialog" aria-label="롤링페이퍼">
        {ctaButtons}
      </div>
    ) : null,
}));
const friend: SurpriseThankCardFriend = {
  contributionId: 11,
  name: "서연",
  profileImageUrl: null,
  organizer: false,
  messageTypes: ["TEXT"],
  contributedDate: "2026-10-03",
  thankCardSent: false,
};
vi.mock("@/widgets/funding/SurpriseThankFriendsSheet", () => ({
  default: ({
    open,
    onThankCardClick,
  }: {
    open: boolean;
    onThankCardClick: (friend: SurpriseThankCardFriend) => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="친구 목록">
        <button onClick={() => onThankCardClick(friend)}>서연 선택</button>
      </div>
    ) : null,
}));
vi.mock("@/widgets/funding/ThankCardSheet", () => ({
  default: ({
    contributionId,
    recipientName,
    onClose,
  }: {
    contributionId: number;
    recipientName: string;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="감사카드 작성">
      <span>{`${contributionId}/${recipientName}`}</span>
      <button onClick={onClose}>감사카드 닫기</button>
    </div>
  ),
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

const makeMessage = (id: number, participantName: string): SurpriseMessage => ({
  messageId: id,
  participantName,
  participantProfileImageUrl: null,
  content: "축하해",
  paperTemplateCode: "A",
  decorationCode: null,
  photoUrl: null,
  voiceUrl: null,
  voiceDurationSeconds: null,
  voiceTranscript: null,
});

const makeSurprise = (overrides: Partial<SurpriseRevealResponse> = {}): SurpriseRevealResponse => ({
  fundingId: 9,
  recipientName: "지유",
  organizerName: "민준",
  productName: "무선 헤드폰",
  productImageUrl: "https://example.com/gift.png",
  productUrl: "https://www.coupang.com/vp/products/1",
  productPrice: 300000,
  productChanged: false,
  confirmedAmount: 300000,
  targetAmount: 300000,
  confirmedPercentage: 100,
  deadline: "2026-10-12T00:00:00",
  participantCount: 5,
  messageCount: 2,
  revealAt: "2026-10-13T00:00:00",
  openedAt: null,
  giftChosen: false,
  messages: [makeMessage(1, "서연"), makeMessage(2, "도윤")],
  ...overrides,
});

const refetch = vi.fn();
const openSurprise = vi.fn();

type QueryState = {
  data?: SurpriseRevealResponse;
  error?: unknown;
  isError?: boolean;
  isSuccess?: boolean;
};

const mockQuery = (state: QueryState) => {
  vi.mocked(useSurpriseRevealQuery).mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isSuccess: !!state.data,
    refetch,
    ...state,
  } as unknown as ReturnType<typeof useSurpriseRevealQuery>);
};

const OPENED_AT = "2026-10-13T00:01:00";
const FRIEND_NAMES = ["민준", "서연", "도윤", "하은"];

type FriendsState = { names?: string[]; isError?: boolean };

const mockFriends = ({ names, isError = false }: FriendsState) => {
  vi.mocked(useSurpriseThankCardFriendsQuery).mockReturnValue({
    data: names && {
      fundingId: 9,
      friends: names.map((name, index) => ({ ...friend, contributionId: index + 1, name })),
    },
    isError,
  } as unknown as ReturnType<typeof useSurpriseThankCardFriendsQuery>);
};

const mockOpen = (isError = false) => {
  vi.mocked(useOpenSurpriseMutation).mockReturnValue({
    mutate: openSurprise,
    isError,
  } as unknown as ReturnType<typeof useOpenSurpriseMutation>);
};

// 기본은 이미 연 서프라이즈와 친구 목록을 받은 상태다
const renderContainer = (data: Partial<SurpriseRevealResponse> = {}) => {
  mockQuery({ data: makeSurprise({ openedAt: OPENED_AT, ...data }) });
  return render(<SurpriseRevealContainer fundingId="9" />);
};

beforeEach(() => {
  vi.clearAllMocks();
  openSurprise.mockReset();
  mockOpen();
  mockFriends({ names: FRIEND_NAMES });
});

describe("SurpriseRevealContainer 로딩·에러·잠금", () => {
  it("조회 중이면 불러오는 중 상태를 보인다", () => {
    mockQuery({});

    render(<SurpriseRevealContainer fundingId="9" />);

    expect(screen.getByRole("status")).toHaveTextContent("서프라이즈를 불러오는 중이에요");
  });

  it("공개 전(FUNDING_016)이면 잠금 화면을 보인다", () => {
    mockQuery({ isError: true, error: new ApiError("FUNDING_016") });

    render(<SurpriseRevealContainer fundingId="9" />);

    expect(screen.getByText("아직 비밀이에요")).toBeInTheDocument();
  });

  it("그 외 조회 실패면 에러 화면에서 다시 시도로 재조회한다", async () => {
    mockQuery({ isError: true, error: new ApiError("COMMON_500") });
    render(<SurpriseRevealContainer fundingId="9" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("성공했는데 데이터가 없으면 에러 화면을 보인다", () => {
    mockQuery({ isSuccess: true });

    render(<SurpriseRevealContainer fundingId="9" />);

    expect(screen.getByText("잠시 문제가 생겼어요")).toBeInTheDocument();
  });
});

describe("SurpriseRevealContainer 열기", () => {
  it("아직 열지 않았으면 들어오자마자 한 번 열고, 이름을 받기 전까지 로딩을 보인다", () => {
    mockFriends({});

    renderContainer({ openedAt: null });

    expect(openSurprise).toHaveBeenCalledTimes(1);
    expect(openSurprise).toHaveBeenCalledWith(9);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("이미 연 서프라이즈면 열기 요청을 보내지 않는다", () => {
    renderContainer();

    expect(openSurprise).not.toHaveBeenCalled();
  });

  it("친구 목록은 연 뒤에만 조회한다", () => {
    mockFriends({});
    renderContainer({ openedAt: null });

    expect(useSurpriseThankCardFriendsQuery).toHaveBeenLastCalledWith(9, false);
  });

  it("열기에 실패하면 에러 화면을 보이고 다시 시도하면 다시 연다", async () => {
    mockOpen(true);
    renderContainer({ openedAt: null });
    openSurprise.mockClear();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(openSurprise).toHaveBeenCalledWith(9);
  });
});

describe("SurpriseRevealContainer 펑 열기 화면", () => {
  it("보탠 친구 전체 이름을 날리고 인원은 participantCount로 보여준다", () => {
    renderContainer({ participantCount: 4 });

    expect(screen.getByTestId("reveal-motion")).toHaveTextContent("민준,서연,도윤,하은");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "친구 4명이 보탬을 보냈어요!",
    );
  });

  it("목표를 채웠으면 금액 뒤에 '목표 달성'을 붙인다", () => {
    renderContainer({ confirmedAmount: 429000, confirmedPercentage: 100 });

    expect(screen.getByText("429,000원이 모였어요 · 목표 달성")).toBeInTheDocument();
  });

  it("친구 목록을 못 받으면 메시지를 남긴 친구 이름으로 대신한다", () => {
    mockFriends({ isError: true });

    renderContainer();

    expect(screen.getByTestId("reveal-motion")).toHaveTextContent("서연,도윤");
  });

  it("친구 목록을 받는 중이면 로딩을 보인다", () => {
    mockFriends({});

    renderContainer();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("'메시지 열어보기'를 누르면 열기 요청 없이 롤링페이퍼를 연다", async () => {
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(openSurprise).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "롤링페이퍼" })).toBeInTheDocument();
  });

  it("메시지가 0개면 롤링페이퍼 없이 결과 화면으로 이동한다", async () => {
    renderContainer({ messageCount: 0, messages: [] });

    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));

    expect(push).toHaveBeenCalledWith("/surprised/9/result");
    expect(screen.queryByRole("dialog", { name: "롤링페이퍼" })).not.toBeInTheDocument();
  });

  it("헤더의 닫기를 누르면 홈으로 replace 한다", async () => {
    renderContainer();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });
});

describe("SurpriseRevealContainer 롤링페이퍼 이후", () => {
  const openRollingPaper = async () => {
    renderContainer();
    await userEvent.click(screen.getByRole("button", { name: "메시지 열어보기" }));
  };

  it("선물 받으러 가기를 누르면 결과 화면으로 이동한다", async () => {
    await openRollingPaper();

    await userEvent.click(screen.getByRole("button", { name: "선물 받으러 가기" }));

    expect(push).toHaveBeenCalledWith("/surprised/9/result");
  });

  it("감사카드 보내기를 누르면 친구 목록 시트를 연다", async () => {
    await openRollingPaper();

    await userEvent.click(screen.getByRole("button", { name: "감사카드 보내기" }));

    expect(screen.getByRole("dialog", { name: "친구 목록" })).toBeInTheDocument();
  });

  it("친구를 고르면 친구 목록을 닫고 그 친구의 감사카드 작성 시트를 연다", async () => {
    await openRollingPaper();
    await userEvent.click(screen.getByRole("button", { name: "감사카드 보내기" }));

    await userEvent.click(screen.getByRole("button", { name: "서연 선택" }));

    expect(screen.queryByRole("dialog", { name: "친구 목록" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "감사카드 작성" })).toHaveTextContent("11/서연");
  });

  it("감사카드 작성 시트를 닫으면 친구 목록으로 돌아간다", async () => {
    await openRollingPaper();
    await userEvent.click(screen.getByRole("button", { name: "감사카드 보내기" }));
    await userEvent.click(screen.getByRole("button", { name: "서연 선택" }));

    await userEvent.click(screen.getByRole("button", { name: "감사카드 닫기" }));

    expect(screen.queryByRole("dialog", { name: "감사카드 작성" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "친구 목록" })).toBeInTheDocument();
  });
});
