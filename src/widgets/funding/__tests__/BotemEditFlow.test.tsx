import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type {
  GuestContributionResponse,
  MyContributionResponse,
} from "@/types/contribution/contribution";
import BotemEditFlow from "@/widgets/funding/BotemEditFlow";

// 수정 요청이 보낸 body를 그대로 반영해 돌려준다
const respondWithBody = async ({ request }: { request: Request }) =>
  HttpResponse.json({ success: true, data: await request.json(), error: null });
const server = setupServer(
  http.patch("*/api/fundings/share/:shareKey/contributions/guest", respondWithBody),
  http.patch("*/api/fundings/share/:shareKey/contributions/:contributionId", respondWithBody),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// jsdom에 없는 dialog API를 단순 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const base = {
  contributionId: 31,
  participantName: "민지",
  amount: 10000,
  status: "PENDING_CONFIRMATION",
  message: "지유야 생일 축하해!\n올해도 같이 많이 웃자",
  paperTemplateCode: "LIME_VIVID_SOLID",
  decorationCode: null,
  photoUrl: null,
  voiceUrl: null,
  voiceDurationSeconds: null,
  voiceTranscript: null,
} as const;
const memberContribution = {
  ...base,
  excludedFromResult: false,
  participatedAt: "2026-10-13T11:20:00",
  payoutAccount: null,
} as MyContributionResponse;
const guestAccess = {
  ...base,
  accessToken: "mock-guest-token",
  accessTokenExpiresAt: "2026-12-31T00:00:00Z",
} as GuestContributionResponse;

const renderFlow = (props: Partial<Parameters<typeof BotemEditFlow>[0]>, onClose = vi.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BotemEditFlow
        open
        skipIdentity
        recipientName="지유"
        shareKey="share-key"
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  );
  return onClose;
};

describe("BotemEditFlow", () => {
  it.each([
    ["회원", { isLoggedIn: true, contribution: memberContribution }],
    ["비회원", { isLoggedIn: false, contribution: guestAccess }],
  ])(
    "%s: 서버의 내 편지로 시작해 저장하면 완료 안내가 뜨고 확인을 누르면 onClose가 호출된다",
    async (_label, props) => {
      const user = userEvent.setup();
      const onClose = renderFlow(props);

      const letter = await screen.findByRole("textbox", { name: "편지 내용" });
      expect(letter).toHaveTextContent("올해도 같이 많이 웃자");
      letter.textContent = "고친 편지";
      fireEvent.input(letter);
      await user.click(screen.getByRole("button", { name: "이대로 저장하기" }));

      expect(await screen.findByRole("heading", { name: "보탬을 수정했어요" })).toBeInTheDocument();
      await user.click(screen.getAllByRole("button", { name: "확인" }).at(-1)!);

      expect(onClose).toHaveBeenCalledTimes(1);
      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { name: "보탬을 수정했어요" }),
        ).not.toBeInTheDocument(),
      );
    },
  );

  it("수정할 보탬이 아직 없으면 편지 시트를 열지 않는다", () => {
    renderFlow({ isLoggedIn: true });
    expect(screen.queryByRole("textbox", { name: "편지 내용" })).not.toBeInTheDocument();
  });
});
