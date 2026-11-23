import { createElement, type ReactElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import FundingDetailContainer from "@/widgets/funding/FundingDetailContainer";

const push = vi.fn();
const back = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back, replace }) }));

// 로그인 뮤테이션은 QueryClient가 필요하므로 대체한다
vi.mock("@/hooks/mutations/auth/useKakaoLoginUriMutation", () => ({
  useKakaoLoginUriMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/hooks/queries/contribution/useMyContributionsQuery", () => ({
  useMyContributionsQuery: () => ({ data: undefined, isPending: false }),
}));
vi.mock("@/hooks/mutations/contribution/useAccessGuestContributionMutation", () => ({
  useAccessGuestContributionMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));

vi.mock("@/hooks/queries/funding/useFundingDetailQuery", async () => {
  const { FUNDING_DETAIL } = await import("@/widgets/funding/__tests__/fixtures/fundingDetail");
  return {
    useFundingDetailQuery: () => ({
      data: FUNDING_DETAIL,
      isError: false,
      isFetchedAfterMount: true,
      refetch: vi.fn(),
    }),
  };
});

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));

const ownerDetail: OwnerFundingDetailResponse = {
  fundingId: 1,
  shareKey: "share-key-1",
  type: "BIRTHDAY",
  title: "지유의 생일",
  celebrantName: "지유",
  story: "헤드폰을 바꾸고 싶어요.",
  promise: null,
  product: {
    name: "소니 WH-1000XM5",
    imageUrl: "https://image.example.com/product.jpg",
    price: 459000,
    url: "https://shop.example.com/product",
  },
  productChanged: false,
  productChangedAt: null,
  targetAmount: 459000,
  deadline: "2099-11-30T23:59:59.999999",
  revealAt: null,
  remainingDays: 7,
  confirmedPercentage: 45,
  pendingPercentage: 15,
  pendingContributionCount: 2,
  targetReached: false,
  extended: false,
  earlyClosedAt: null,
  giftPreparedAt: null,
  participantCount: 1,
  participants: [
    {
      contributionId: 31,
      order: 1,
      name: "하린",
      profileImageUrl: null,
      status: "PENDING_CONFIRMATION",
      participatedAt: "2026-11-20T14:03:12",
      thankCardSent: false,
      thankCardSentAt: null,
    },
  ],
  messageCount: 3,
  managementState: "IN_PROGRESS",
  actions: {
    canCloseEarly: true,
    canExtend: false,
    canChangeProduct: true,
    canReissueShareCard: true,
  },
};

const server = setupServer(
  http.get("*/api/fundings/:fundingId/management", () =>
    HttpResponse.json({ success: true, data: ownerDetail, error: null }),
  ),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const useSurpriseResponse = () =>
  server.use(
    http.get("*/api/fundings/:fundingId/management", () =>
      HttpResponse.json({
        success: true,
        data: { ...ownerDetail, type: "SURPRISE", title: "지유의 펀딩" },
        error: null,
      }),
    ),
  );

const render = (ui: ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return rtlRender(ui, { wrapper });
};

describe("FundingDetailContainer", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("서프라이즈 펀딩 상세는 '{닉네임}의 서프라이즈 펀딩' 제목과 확인 대기 안내를 보여준다", async () => {
    useSurpriseResponse();
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    expect(
      await screen.findByRole("heading", { name: /지유의\s서프라이즈 펀딩/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("확인 대기 2건이 있어요")).toBeInTheDocument();
  });

  it("되돌아갈 히스토리가 있으면 뒤로가기는 이전 화면으로 돌아간다", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    useSurpriseResponse();
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
    expect(push).not.toHaveBeenCalled();
  });

  it("친구 id 없이 열어도 서프라이즈 펀딩이면 서프라이즈 개설자 화면으로 보여준다", async () => {
    server.use(
      http.get("*/api/fundings/:fundingId/management", () =>
        HttpResponse.json({
          success: true,
          data: { ...ownerDetail, type: "SURPRISE" },
          error: null,
        }),
      ),
    );
    render(<FundingDetailContainer fundingId="1" />);

    expect(await screen.findByRole("heading", { name: /서프라이즈 펀딩/ })).toBeInTheDocument();
  });

  it("마감된 펀딩 상세는 뒤로가기 버튼이 있고, 누르면 이전 화면으로 돌아간다", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    server.use(
      http.get("*/api/fundings/:fundingId/management", () =>
        HttpResponse.json({
          success: true,
          data: { ...ownerDetail, managementState: "CLOSED", remainingDays: null },
          error: null,
        }),
      ),
    );
    render(<FundingDetailContainer fundingId="1" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(back).toHaveBeenCalled());
  });

  it("마감된 내 생일 펀딩은 결과 팡을 연 뒤에만 '롤링페이퍼 보기'를 누를 수 있다", async () => {
    const closed = { ...ownerDetail, managementState: "CLOSED", remainingDays: null };
    server.use(
      http.get("*/api/fundings/:fundingId/management", () =>
        HttpResponse.json({ success: true, data: closed, error: null }),
      ),
      http.get("*/api/fundings/:fundingId/result", () =>
        HttpResponse.json({
          success: true,
          data: { resultOpenedAt: "2026-11-25T10:00:00" },
          error: null,
        }),
      ),
    );
    render(<FundingDetailContainer fundingId="1" />);

    const button = await screen.findByRole("button", { name: "롤링페이퍼 보기" });
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("마감된 펀딩의 결과가 아직 열 수 없는 409(FUNDING_005)여도 화면은 그대로 두고 버튼에 안내 문구를 보여준다", async () => {
    const closed = { ...ownerDetail, managementState: "CLOSED", remainingDays: null };
    server.use(
      http.get("*/api/fundings/:fundingId/management", () =>
        HttpResponse.json({ success: true, data: closed, error: null }),
      ),
      http.get("*/api/fundings/:fundingId/result", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "FUNDING_005", message: "펀딩이 마감된 후 결과를 확인할 수 있습니다." },
          },
          { status: 409 },
        ),
      ),
    );
    render(<FundingDetailContainer fundingId="1" />);

    const button = await screen.findByRole("button", { name: "홈에서 펑! 터뜨려 주세요" });
    expect(button).toBeDisabled();
  });

  it("되돌아갈 히스토리가 없으면 뒤로가기는 친구 프로필로 이동한다", async () => {
    useSurpriseResponse();
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/friends/7"));
    expect(back).not.toHaveBeenCalled();
  });

  it("되돌아갈 히스토리가 없고 친구 id도 없으면 뒤로가기는 홈으로 이동한다", async () => {
    render(<FundingDetailContainer fundingId="1" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    expect(back).not.toHaveBeenCalled();
  });

  it("친구 id가 있어도 일반 펀딩이면 서프라이즈 화면이 아니다", async () => {
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    expect(await screen.findByRole("heading", { name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.queryByText(/확인 대기 \d+건이 있어요/)).not.toBeInTheDocument();
  });

  it("친구 id가 없는 일반 펀딩도 뒤로가기가 있고, 누르면 이전 화면으로 돌아간다", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(3);
    render(<FundingDetailContainer fundingId="1" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(back).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });

  it("친구 id가 없으면 펀딩 주인 화면으로 관리 상세를 불러오는 동안 스켈레톤을 보여준다", () => {
    const { container } = render(<FundingDetailContainer fundingId="1" />);

    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("펀딩 주인 화면은 관리 상세의 제목·달성률을 보여주고 툴팁은 없다", async () => {
    render(<FundingDetailContainer fundingId="1" />);

    expect(await screen.findByRole("heading", { name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "45");
    expect(screen.queryByText("나도 민재님께 보태볼까요?")).not.toBeInTheDocument();
  });

  it("관리 상세를 불러오지 못하면 안내와 다시 시도를 보여주고, 다시 시도하면 화면이 나온다", async () => {
    server.use(
      http.get(
        "*/api/fundings/:fundingId/management",
        () => HttpResponse.json({}, { status: 500 }),
        {
          once: true,
        },
      ),
    );
    render(<FundingDetailContainer fundingId="1" />);

    expect(await screen.findByText("펀딩 정보를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByRole("heading", { name: "지유의 생일" })).toBeInTheDocument();
  });
});
