import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { MOCK_FUNDING_MANAGEMENT } from "@/apis/funding/fundingService.msw";

import FundingDetailContainer from "@/widgets/funding/FundingDetailContainer";

const push = vi.fn();
const back = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back, replace: vi.fn() }) }));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
  ),
}));

vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));

// 개설자 화면은 더보기 플로우가 mutation 훅을 쓰므로 QueryClient로 감싼다
const render = (ui: ReactElement) =>
  rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

// 개설자 화면(surprise·owner)은 펀딩 관리 API로 데이터를 받아 그린다
const server = setupServer(
  http.get("*/api/fundings/:fundingId/management", () =>
    HttpResponse.json({ success: true, data: MOCK_FUNDING_MANAGEMENT, error: null }),
  ),
);
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("FundingDetailContainer", () => {
  afterEach(() => vi.clearAllMocks());

  it("서프라이즈 펀딩 상세로 자물쇠와 확인 대기 안내를 보여준다", async () => {
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    expect(await screen.findByRole("img", { name: "서프라이즈 펀딩" })).toBeInTheDocument();
    expect(screen.getByText("확인 대기 3건이 있어요")).toBeInTheDocument();
  });

  it("뒤로가기를 누르면 친구 프로필로 이동한다", async () => {
    render(<FundingDetailContainer fundingId="1" friendId="7" />);

    await userEvent.click(await screen.findByRole("button", { name: "뒤로가기" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/friends/7"));
  });

  it("친구 id가 없으면 mock 역할(펀딩 주인)로 툴팁·자물쇠 없는 펀딩 화면을 보여준다", async () => {
    render(<FundingDetailContainer fundingId="1" />);

    expect(await screen.findByRole("heading", { name: "지유의 생일" })).toBeInTheDocument();
    expect(screen.queryByText("아직 비밀이에요")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "서프라이즈 펀딩" })).not.toBeInTheDocument();
    expect(screen.queryByText("나도 지유님께 보태볼까요?")).not.toBeInTheDocument();
  });
});
