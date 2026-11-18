import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { GiftVerificationBannerVariant } from "@/hooks/useGiftVerificationBannerSession";
import { hasShownGiftVerificationCardBanner } from "@/utils/home/giftVerificationBannerStorage";
import GiftVerificationBannerLayer from "@/widgets/home/GiftVerificationBannerLayer";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const server = setupServer();

beforeAll(() => server.listen());
afterAll(() => server.close());

const mockBanner = (data: { visible: boolean; pendingCount: number }) => {
  server.use(
    http.get("*/api/home/gift-verifications/banner", () =>
      HttpResponse.json({ success: true, data, error: null }),
    ),
    http.get("*/api/home/gift-verifications", () =>
      HttpResponse.json({
        success: true,
        data: { pendingCount: 0, targets: [] },
        error: null,
      }),
    ),
  );
};

const renderLayer = (
  variant: GiftVerificationBannerVariant = "card",
  children: (cardBanner: ReactNode) => ReactNode = cardBanner => (
    <div data-testid="home">{cardBanner}</div>
  ),
) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return render(
    <GiftVerificationBannerLayer variant={variant}>{children}</GiftVerificationBannerLayer>,
    { wrapper },
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

afterEach(() => {
  server.resetHandlers();
});

describe("GiftVerificationBannerLayer", () => {
  it("variant가 card면 카드형 배너를 보여준다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });

    renderLayer();

    expect(await screen.findByRole("button", { name: "인증하러 가기" })).toBeInTheDocument();
  });

  it("카드형 배너가 그려지면 이번 세션에 본 것으로 기록한다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });

    renderLayer();

    await screen.findByRole("button", { name: "인증하러 가기" });
    expect(hasShownGiftVerificationCardBanner()).toBe(true);
  });

  it("홈이 로딩·오류라 카드를 그리지 않으면 본 것으로 기록하지 않는다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });

    renderLayer("card", () => <div data-testid="home-loading" />);

    // 배너 응답이 처리될 시간을 준 뒤에도 기록이 없어야 한다
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(hasShownGiftVerificationCardBanner()).toBe(false);
  });

  it("variant가 pinned면 고정형 배너를 보여준다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });

    renderLayer("pinned");

    expect(await screen.findByRole("button", { name: "인증하기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "인증하러 가기" })).not.toBeInTheDocument();
  });

  it("닫기를 누르면 배너가 사라진다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });
    renderLayer();

    await userEvent.click(await screen.findByRole("button", { name: "선물 인증 안내 닫기" }));

    expect(screen.queryByRole("region", { name: "선물 인증 안내" })).not.toBeInTheDocument();
  });

  it("banner 응답의 visible이 false면 배너를 보여주지 않는다", async () => {
    mockBanner({ visible: false, pendingCount: 0 });

    renderLayer();

    // 응답이 처리될 시간을 준 뒤에도 배너가 없어야 한다
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.queryByRole("region", { name: "선물 인증 안내" })).not.toBeInTheDocument();
  });

  it("배너의 인증 버튼을 누르면 '선물 인증' 바텀시트가 열린다", async () => {
    mockBanner({ visible: true, pendingCount: 2 });
    renderLayer();

    await userEvent.click(await screen.findByRole("button", { name: "인증하러 가기" }));

    expect(await screen.findByText("선물 인증")).toBeInTheDocument();
  });
});
