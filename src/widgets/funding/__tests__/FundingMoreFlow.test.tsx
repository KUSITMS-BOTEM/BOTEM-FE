import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import FundingMoreFlow from "@/widgets/funding/FundingMoreFlow";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "민지" } }),
}));

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const shareCard = {
  cardTitle: "지유의 생일 펀딩",
  wish: { id: 1, productName: "소니 WH-1000XM5", price: 468000 },
  info: { targetAmount: "429000", deadline: "2099-12-31" },
  progress: 60,
};

const renderFlow = (onClose = vi.fn()) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <FundingMoreFlow
        open
        fundingId={1}
        shareKey="share-key-1"
        extended={false}
        actions={{ canCloseEarly: true, canReissueShareCard: true }}
        shareCard={shareCard}
        onClose={onClose}
      />
    </QueryClientProvider>,
  );

const confirmDialog = () => screen.getByText("지금 마감할까요?").closest("dialog");

describe("FundingMoreFlow", () => {
  it("공유 카드 다시 받기를 누르면 더보기 시트를 닫고 공유 카드 화면을 연다", async () => {
    const onClose = vi.fn();
    renderFlow(onClose);

    await userEvent.click(await screen.findByRole("button", { name: "공유 카드 다시 받기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("button", { name: "공유 카드 저장" })).toBeInTheDocument();
  });

  it("조기 마감하기를 누르면 더보기 시트를 닫고 마감 확인 Dialog를 연다", async () => {
    const onClose = vi.fn();
    renderFlow(onClose);

    await userEvent.click(await screen.findByRole("button", { name: /조기 마감하기/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(confirmDialog()).toHaveAttribute("open");
  });

  it("마감 API가 실패하면 확인 Dialog가 닫히지 않아 다시 시도할 수 있다", async () => {
    server.use(
      http.post("*/api/fundings/:fundingId/close", () =>
        HttpResponse.json(
          { success: false, data: null, error: { code: "INTERNAL", message: "fail" } },
          { status: 500 },
        ),
      ),
    );
    renderFlow();

    await userEvent.click(await screen.findByRole("button", { name: /조기 마감하기/ }));
    await userEvent.click(screen.getByRole("button", { name: "예" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "아니오" })).toBeEnabled());
    expect(confirmDialog()).toHaveAttribute("open");
  });

  it("마감 요청 중에는 아니오 버튼이 비활성화된다", async () => {
    server.use(
      http.post("*/api/fundings/:fundingId/close", async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );
    renderFlow();

    await userEvent.click(await screen.findByRole("button", { name: /조기 마감하기/ }));
    await userEvent.click(screen.getByRole("button", { name: "예" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "아니오" })).toBeDisabled());
  });
});
