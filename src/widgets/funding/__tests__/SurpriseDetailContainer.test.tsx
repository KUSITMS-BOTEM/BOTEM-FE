import { createElement, type ReactElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { SurpriseRevealResponse } from "@/types/funding/surprise";
import SurpriseDetailContainer from "@/widgets/funding/SurpriseDetailContainer";

const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ back, push: vi.fn() }) }));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

const surprise: SurpriseRevealResponse = {
  fundingId: 22,
  recipientName: "서준",
  organizerName: "하린",
  productName: "에어팟 프로 2",
  productImageUrl: "",
  productUrl: "https://www.coupang.com/vp/products/1",
  productPrice: 459000,
  productChanged: false,
  confirmedAmount: 420000,
  targetAmount: 459000,
  confirmedPercentage: 91,
  deadline: "2025-10-10T23:59:59",
  participantCount: 6,
  messageCount: 6,
  revealAt: "2025-10-11T00:00:00",
  openedAt: "2025-10-11T09:00:00",
  giftChosen: false,
  messages: [],
};

const server = setupServer(
  http.get("*/api/fundings/:fundingId/surprise", () =>
    HttpResponse.json({ success: true, data: surprise, error: null }),
  ),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

const render = (ui: ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return rtlRender(ui, { wrapper });
};

describe("SurpriseDetailContainer", () => {
  it("조회 중에는 로딩 상태를 보여준다", () => {
    render(<SurpriseDetailContainer fundingId="22" />);

    expect(screen.getByRole("main", { busy: true })).toBeInTheDocument();
  });

  it("'{이름}의 서프라이즈 펀딩' 제목과 진행 카드, 롤링페이퍼 보기 버튼을 보여준다", async () => {
    render(<SurpriseDetailContainer fundingId="22" />);

    expect(
      await screen.findByRole("heading", { name: /서준의\s+서프라이즈 펀딩/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "펀딩 달성률" })).toHaveAttribute(
      "aria-valuenow",
      "91",
    );
    expect(screen.getByText("목표가 459,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "롤링페이퍼 보기" })).toBeInTheDocument();
  });

  it("공개 전(404 FUNDING_016)이면 잠금 안내를 보여준다", async () => {
    server.use(
      http.get("*/api/fundings/:fundingId/surprise", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "FUNDING_016", message: "공개된 서프라이즈를 찾을 수 없습니다." },
          },
          { status: 404 },
        ),
      ),
    );
    render(<SurpriseDetailContainer fundingId="22" />);

    expect(await screen.findByText("아직 비밀이에요")).toBeInTheDocument();
  });

  it("그 밖의 조회 실패는 재시도를 안내한다", async () => {
    server.use(
      http.get("*/api/fundings/:fundingId/surprise", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "FUNDING_002", message: "펀딩을 찾을 수 없습니다." },
          },
          { status: 404 },
        ),
      ),
    );
    render(<SurpriseDetailContainer fundingId="22" />);

    expect(await screen.findByRole("button", { name: /다시 시도/ })).toBeInTheDocument();
  });
});
