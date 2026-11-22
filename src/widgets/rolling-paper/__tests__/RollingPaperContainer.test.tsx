import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useRollingPaperQuery } from "@/hooks/queries/funding/useRollingPaperQuery";
import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";

vi.mock("@/hooks/queries/funding/useRollingPaperQuery", () => ({
  useRollingPaperQuery: vi.fn(),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

const onClose = vi.fn();
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

const mockQuery = (state: { messages?: RollingPaperMessage[]; isLoading?: boolean }) =>
  vi.mocked(useRollingPaperQuery).mockReturnValue({
    data: state.messages && {
      fundingId: 1,
      celebrantName: "지유",
      messageCount: state.messages.length,
      messages: state.messages,
    },
    isLoading: state.isLoading ?? false,
    refetch,
  } as unknown as ReturnType<typeof useRollingPaperQuery>);

beforeEach(() => {
  pushMock.mockClear();
  onClose.mockClear();
  refetch.mockClear();
  mockQuery({ messages: toMessages(5) });
});

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

describe("RollingPaperContainer", () => {
  it("시트 안에 타이틀·힌트·공유 버튼이 보이고 생일 인사 문구는 없다", () => {
    const { container } = render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    // 타이틀이 <br />로 줄바꿈돼 textContent에는 두 줄이 공백 없이 이어진다
    expect(container.textContent).toContain("총 5개의 메세지가도착했어요!");
    expect(container.textContent).not.toContain("생일 축하해요");
    expect(screen.getByText("클릭 시, 크게 볼 수 있어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
  });

  it("하단 CTA에 선물 받으러 가기 버튼이 보인다", () => {
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(screen.getByRole("button", { name: "선물 받으러 가기" })).toBeInTheDocument();
  });

  it("showGiftCta가 false면 하단 CTA를 보여주지 않는다", () => {
    render(<RollingPaperContainer fundingId={1} open showGiftCta={false} onClose={onClose} />);

    expect(screen.queryByRole("button", { name: "선물 받으러 가기" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "편지지 크게 보기" })).toBeInTheDocument();
  });

  it("타이틀 개수는 응답으로 받은 메시지 개수를 나타낸다", () => {
    mockQuery({ messages: toMessages(3) });
    const { container, rerender } = render(
      <RollingPaperContainer fundingId={1} open onClose={onClose} />,
    );
    expect(container.textContent).toContain("총 3개의 메세지가");

    mockQuery({ messages: toMessages(12) });
    rerender(<RollingPaperContainer fundingId={1} open onClose={onClose} />);
    expect(container.textContent).toContain("총 12개의 메세지가");
  });

  it("시트가 열릴 때만 해당 펀딩의 롤링페이퍼를 조회한다", () => {
    const { rerender } = render(
      <RollingPaperContainer fundingId={7} open={false} onClose={onClose} />,
    );
    expect(useRollingPaperQuery).toHaveBeenLastCalledWith(7, false);

    rerender(<RollingPaperContainer fundingId={7} open onClose={onClose} />);
    expect(useRollingPaperQuery).toHaveBeenLastCalledWith(7, true);
  });

  it("조회 중에는 스켈레톤을 보여주고 편지지는 보여주지 않는다", () => {
    mockQuery({ isLoading: true });
    const { container } = render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(container.querySelector("[aria-busy]")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "편지지 크게 보기" })).not.toBeInTheDocument();
  });

  it("조회에 실패하면 안내와 함께 다시 시도할 수 있다", async () => {
    const user = userEvent.setup();
    mockQuery({});
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(screen.getByText("롤링페이퍼를 불러오지 못했어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("도착한 메세지가 없으면 빈 상태 안내를 보여준다", () => {
    mockQuery({ messages: [] });
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(screen.getByText("도착한 메세지가 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "편지지 크게 보기" })).not.toBeInTheDocument();
  });

  it("편지지를 누르면 하단 CTA가 아래로 내려가며 사라지도록 표시된다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);
    const cta = screen
      .getByRole("button", { name: "선물 받으러 가기" })
      .closest(".pointer-events-none");
    expect(cta).not.toHaveClass("opacity-0");

    await user.click(screen.getByRole("button", { name: "편지지 크게 보기" }));

    expect(cta).toHaveClass("opacity-0");
  });

  it("편지지를 누르면 회색이 다 덮인 뒤에 롤링페이퍼 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "편지지 크게 보기" }));
    expect(pushMock).not.toHaveBeenCalled();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/rolling-paper/1"), {
      timeout: 3000,
    });
  });

  it("선물 받으러 가기를 누르면 선물 확인 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "선물 받으러 가기" }));

    expect(pushMock).toHaveBeenCalledWith("/funding/1/result");
  });

  it("닫기 버튼을 누르면 onClose를 호출한다", async () => {
    const user = userEvent.setup();
    render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("편지지를 누른 직후 시트를 닫았다 다시 열면 편지지를 다시 누를 수 있다", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "편지지 크게 보기" }));
    await user.click(screen.getByRole("button", { name: "닫기" }));
    rerender(<RollingPaperContainer fundingId={1} open={false} onClose={onClose} />);
    rerender(<RollingPaperContainer fundingId={1} open onClose={onClose} />);

    expect(await screen.findByRole("button", { name: "편지지 크게 보기" })).toBeEnabled();
  });

  it("open이 false면 시트가 열리지 않는다", () => {
    const { container } = render(
      <RollingPaperContainer fundingId={1} open={false} onClose={onClose} />,
    );

    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });
});
