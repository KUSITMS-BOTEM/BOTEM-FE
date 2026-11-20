import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import type { PendingContributionResponse } from "@/types/contribution/contribution";
import { openTossApp } from "@/utils/funding/openTossApp";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";

vi.mock("@/utils/funding/openTossApp");
vi.mock("@/components/ToastMessage", () => ({
  default: ({
    show,
    text,
    buttonText,
    onButtonClick,
  }: {
    show: boolean;
    text: string;
    buttonText?: string;
    onButtonClick?: () => void;
  }) =>
    show ? (
      <div role="status">
        {text}
        {buttonText && <button onClick={onButtonClick}>{buttonText}</button>}
      </div>
    ) : null,
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

const FUNDING_ID = 12;
const BASE = `*/api/fundings/${FUNDING_ID}/contributions`;

const INITIAL: PendingContributionResponse[] = [
  {
    contributionId: 1,
    participantName: "하린이",
    profileImageUrl: null,
    participatedAt: "2026-11-18T11:20:00",
    amount: 45000,
  },
  {
    contributionId: 2,
    participantName: "도윤이",
    profileImageUrl: null,
    participatedAt: "2026-11-16T09:05:00",
    amount: 30000,
  },
  {
    contributionId: 3,
    participantName: "서준이",
    profileImageUrl: null,
    participatedAt: "2026-11-16T08:00:00",
    amount: 20000,
  },
];

let pending: PendingContributionResponse[] = [];
const requests: string[] = [];

const progress = {
  confirmedPercentage: 50,
  pendingPercentage: 0,
  pendingContributionCount: 0,
  targetReached: false,
};

const server = setupServer(
  http.get(`${BASE}/pending`, () =>
    HttpResponse.json({
      success: true,
      data: { pendingContributionCount: pending.length, contributions: pending },
      error: null,
    }),
  ),
  http.post(`${BASE}/decisions`, async ({ request }) => {
    const { contributionIds, decision } = (await request.json()) as {
      contributionIds: number[];
      decision: "CONFIRM" | "REJECT";
    };
    requests.push(`${decision}:${contributionIds.join(",")}`);
    pending = pending.filter(item => !contributionIds.includes(item.contributionId));
    const status = decision === "CONFIRM" ? "CONFIRMED" : "REJECTED";
    const contributions = contributionIds.map(contributionId => ({
      contributionId,
      status,
      changed: true,
    }));
    return HttpResponse.json({ success: true, data: { contributions, progress }, error: null });
  }),
  http.post(`${BASE}/decisions/undo`, async ({ request }) => {
    const { contributionIds } = (await request.json()) as { contributionIds: number[] };
    requests.push(`UNDO:${contributionIds.join(",")}`);
    pending = INITIAL.filter(
      item =>
        contributionIds.includes(item.contributionId) ||
        pending.some(({ contributionId }) => contributionId === item.contributionId),
    );
    const contributions = contributionIds.map(contributionId => ({
      contributionId,
      status: "PENDING_CONFIRMATION",
      changed: true,
    }));
    return HttpResponse.json({ success: true, data: { contributions, progress }, error: null });
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());

beforeEach(() => {
  vi.clearAllMocks();
  pending = [...INITIAL];
  requests.length = 0;
});

afterEach(() => server.resetHandlers());

type SheetProps = Parameters<typeof DepositConfirmSheet>[0];

const renderSheet = (
  props: Partial<Pick<SheetProps, "onClose">> &
    ({ variant?: "default" } | { variant: "preReveal"; onReveal: () => void }) = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return render(<DepositConfirmSheet open fundingId={FUNDING_ID} onClose={vi.fn()} {...props} />, {
    wrapper,
  });
};

const checkbox = (name: string) => screen.getByRole("checkbox", { name: new RegExp(name) });
const waitForList = () => screen.findByRole("heading", { name: "입금 확인 3건" });

describe("DepositConfirmSheet 목록", () => {
  it("불러오는 동안 스켈레톤을 보여준다", () => {
    const { baseElement } = renderSheet();

    expect(baseElement.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("날짜별로 묶어 보내는 사람·시간을 보여주고 건수는 목록 개수다", async () => {
    renderSheet();

    await waitForList();
    expect(screen.getByRole("heading", { name: "11월 18일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "11월 16일" })).toBeInTheDocument();
    expect(checkbox("도윤이의 보탬")).toHaveAccessibleName(/09:05/);
  });

  it("항목마다 보탠 금액을 보여준다", async () => {
    renderSheet();

    await waitForList();
    expect(checkbox("하린이의 보탬")).toHaveAccessibleName(/45,000원/);
    expect(checkbox("도윤이의 보탬")).toHaveAccessibleName(/30,000원/);
  });

  it("목록을 불러오지 못하면 안내와 다시 시도를 보여주고, 다시 시도하면 목록이 나온다", async () => {
    server.use(
      http.get(`${BASE}/pending`, () => HttpResponse.json({}, { status: 500 }), { once: true }),
    );
    renderSheet();

    expect(await screen.findByText("입금 내역을 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitForList();
  });

  it("선택하기 전에는 받았어요·못받았어요가 비활성이고, 하나 선택하면 활성화된다", async () => {
    renderSheet();
    await waitForList();
    expect(screen.getByRole("button", { name: "받았어요" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeDisabled();

    await userEvent.click(checkbox("하린이의 보탬"));

    expect(screen.getByRole("button", { name: "받았어요" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeEnabled();
  });
});

describe("DepositConfirmSheet 공개 전 입금 확인", () => {
  const renderPreReveal = (onReveal = vi.fn()) => {
    renderSheet({ variant: "preReveal", onReveal });
    return onReveal;
  };

  it("공개 전 제목과 남은 건수 안내·미확인 보탬 건수를 보여주고, 남은 건이 있으면 공개 버튼은 없다", async () => {
    renderPreReveal();

    expect(await screen.findByRole("heading", { name: "미확인 보탬 3건" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "공개 전에 확인해주세요" })).toBeInTheDocument();
    expect(screen.getByText("확인이 필요한 보탬이 3건 있어요.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "팡! 열어보기" })).not.toBeInTheDocument();
  });

  it("모두 확인하면 남은 건수 안내를 숨기고, 팡! 열어보기를 누르면 onReveal을 호출한다", async () => {
    const onReveal = renderPreReveal();
    await screen.findByRole("heading", { name: "미확인 보탬 3건" });

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(await screen.findByRole("heading", { name: "미확인 보탬 0건" })).toBeInTheDocument();
    expect(screen.getByText("모든 내역을 확인했어요")).toBeInTheDocument();
    expect(screen.queryByText(/확인이 필요한 보탬이/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "팡! 열어보기" }));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});

describe("DepositConfirmSheet 처리와 토스트", () => {
  it("개별 선택 후 받았어요를 누르면 CONFIRM으로 처리 요청하고 재조회한 목록과 안내 토스트를 보여준다", async () => {
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(await screen.findByText(/1건의 입금을 모두 확인했어요/)).toBeInTheDocument();
    expect(requests).toEqual(["CONFIRM:1"]);
    expect(screen.getByRole("heading", { name: "입금 확인 2건" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /하린이의 보탬/ })).not.toBeInTheDocument();
  });

  it("여러 건을 선택하고 못받았어요를 누르면 한 번의 REJECT 요청으로 함께 처리한다", async () => {
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(checkbox("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(await screen.findByText(/2건의 입금을 못받음 처리했어요/)).toBeInTheDocument();
    expect(requests).toEqual(["REJECT:1,2"]);
  });

  it("모두 선택하고 받았어요를 누르면 전체를 한 번에 처리하고 빈 상태를 보여준다", async () => {
    renderSheet();
    await waitForList();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(await screen.findByText(/모든 건의 입금을 확인했어요/)).toBeInTheDocument();
    expect(requests).toEqual(["CONFIRM:1,2,3"]);
    expect(screen.getByRole("heading", { name: "입금 확인 0건" })).toBeInTheDocument();
    expect(screen.getByText("모든 내역을 확인했어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "팡! 열어보기" })).not.toBeInTheDocument();
  });

  it("처리 토스트의 실행 취소를 누르면 처리한 건을 되돌리고 목록에 다시 보여준다", async () => {
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    await screen.findByRole("heading", { name: "입금 확인 2건" });
    await userEvent.click(await screen.findByRole("button", { name: "실행 취소" }));

    await waitForList();
    expect(checkbox("하린이의 보탬")).toBeInTheDocument();
    expect(requests).toEqual(["CONFIRM:1", "UNDO:1"]);
    expect(screen.queryByText(/1건의 입금을 모두 확인했어요/)).not.toBeInTheDocument();
  });

  it("이번 요청으로 바뀐 참여가 없으면 실행 취소 버튼을 보여주지 않는다", async () => {
    server.use(
      http.post(`${BASE}/decisions`, () =>
        HttpResponse.json({
          success: true,
          data: {
            contributions: [{ contributionId: 1, status: "CONFIRMED", changed: false }],
            progress,
          },
          error: null,
        }),
      ),
    );
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(await screen.findByText(/1건의 입금을 모두 확인했어요/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "실행 취소" })).not.toBeInTheDocument();
  });

  it("요청 중에는 버튼이 잠겨 연달아 눌러도 요청이 한 번만 나간다", async () => {
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    const received = screen.getByRole("button", { name: "받았어요" });
    await userEvent.click(received);
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    await screen.findByText(/1건의 입금을 모두 확인했어요/);
    expect(requests).toEqual(["CONFIRM:1"]);
  });

  it("처리 요청이 실패하면 토스트 없이 선택을 유지해 다시 누를 수 있다", async () => {
    server.use(http.post(`${BASE}/decisions`, () => HttpResponse.json({}, { status: 500 })));
    renderSheet();
    await waitForList();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "받았어요" })).toBeEnabled());
    expect(checkbox("하린이의 보탬")).toBeChecked();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("DepositConfirmSheet 토스 확인하기", () => {
  it("앱이 열리지 않으면 모바일에서 열어달라는 안내를 보여준다", async () => {
    vi.mocked(openTossApp).mockResolvedValue(false);
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /토스 확인하기/ }));

    expect(await screen.findByText(/모바일에서 토스 앱을 열어/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "실행 취소" })).not.toBeInTheDocument();
  });

  it("앱이 열리면 안내를 보여주지 않는다", async () => {
    vi.mocked(openTossApp).mockResolvedValue(true);
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /토스 확인하기/ }));

    expect(openTossApp).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
