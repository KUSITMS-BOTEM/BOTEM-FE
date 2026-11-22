import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useRollingPaperQuery } from "@/hooks/queries/funding/useRollingPaperQuery";
import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import RollingPaperDetailContainer from "@/widgets/rolling-paper/RollingPaperDetailContainer";

vi.mock("@/hooks/queries/funding/useRollingPaperQuery", () => ({
  useRollingPaperQuery: vi.fn(),
}));
vi.mock("@/widgets/rolling-paper/RollingPaperWheel", () => ({
  default: ({
    letters,
    voices,
  }: {
    letters: { senderName: string }[];
    voices: ({ senderName: string } | null)[];
  }) => (
    <div
      data-testid="rolling-paper-wheel"
      data-count={letters.length}
      data-senders={letters.map(letter => letter.senderName).join(",")}
      data-voices={voices.map(voice => voice?.senderName ?? "-").join(",")}
    />
  ),
}));

const backMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock }),
}));

const refetch = vi.fn();

const toMessages = (count: number): RollingPaperMessage[] =>
  Array.from({ length: count }, (_, index) => ({
    messageId: index + 1,
    participantName: `친구${index + 1}`,
    participantProfileImageUrl: null,
    content: `축하해 ${index + 1}`,
    paperTemplateCode: "ORANGE_WHITE_DOT",
    decorationCode: null,
    photoUrl: null,
    voiceUrl: null,
    voiceDurationSeconds: null,
    voiceTranscript: null,
  }));

const mockQuery = (value: { messages?: RollingPaperMessage[]; isLoading?: boolean }) => {
  vi.mocked(useRollingPaperQuery).mockReturnValue({
    data: value.messages && {
      fundingId: 12,
      celebrantName: "지유",
      messageCount: value.messages.length,
      messages: value.messages,
    },
    isLoading: value.isLoading ?? false,
    refetch,
  } as unknown as ReturnType<typeof useRollingPaperQuery>);
};

beforeEach(() => vi.clearAllMocks());

describe("RollingPaperDetailContainer", () => {
  it("rollingPaperId를 펀딩 id로 보고 숫자로 바꿔 롤링페이퍼를 조회한다", () => {
    mockQuery({ isLoading: true });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(useRollingPaperQuery).toHaveBeenCalledWith(12);
  });

  it("뒤로 가기 버튼을 누르면 이전 페이지로 돌아간다", async () => {
    mockQuery({ messages: toMessages(5) });
    const user = userEvent.setup();
    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    await waitFor(() => expect(backMock).toHaveBeenCalledTimes(1));
  });

  it("조회한 메세지를 편지지로 바꿔 휠에 넘긴다", () => {
    mockQuery({ messages: toMessages(7) });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    const wheel = screen.getByTestId("rolling-paper-wheel");
    expect(wheel).toHaveAttribute("data-count", "7");
    expect(wheel.getAttribute("data-senders")?.split(",")[0]).toBe("친구1");
  });

  it("음성이 있는 메세지만 음성 정보를 휠에 넘긴다", () => {
    const messages = toMessages(3);
    messages[0] = { ...messages[0], voiceUrl: "https://cdn.example.com/voice.wav" };
    mockQuery({ messages });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByTestId("rolling-paper-wheel")).toHaveAttribute("data-voices", "친구1,-,-");
  });

  it("뒤로 가기 버튼은 페이드인을 위해 투명하게 시작한다", () => {
    mockQuery({ messages: toMessages(5) });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByRole("button", { name: "뒤로 가기" }).parentElement).toHaveStyle({
      opacity: "0",
    });
  });

  it("로딩 중이면 로딩 안내를 보여주고 휠은 그리지 않는다", () => {
    mockQuery({ isLoading: true });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByRole("status")).toHaveTextContent("메세지를 불러오는 중이에요");
    expect(screen.queryByTestId("rolling-paper-wheel")).not.toBeInTheDocument();
  });

  it("조회에 실패하면 에러 문구와 '다시 시도'를 보여주고 누르면 refetch한다", async () => {
    mockQuery({});
    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByText("메세지를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("메세지가 0개면 빈 안내를 보여주고 휠은 그리지 않는다", () => {
    mockQuery({ messages: [] });

    render(<RollingPaperDetailContainer rollingPaperId="12" />);

    expect(screen.getByText("도착한 메세지가 없어요")).toBeInTheDocument();
    expect(screen.queryByTestId("rolling-paper-wheel")).not.toBeInTheDocument();
  });
});
