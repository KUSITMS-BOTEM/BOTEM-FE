import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseDetailView from "@/widgets/funding/SurpriseDetailView";

const messages = Array.from({ length: 6 }, (_, index) => ({
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

vi.mock("@/hooks/queries/funding/useRollingPaperQuery", () => ({
  useRollingPaperQuery: () => ({
    data: { fundingId: 22, celebrantName: "서준", messageCount: 6, messages },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as Record<string, string>)} />
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

const surprise = {
  fundingId: 22,
  recipientName: "서준",
  productName: "에어팟 프로 2",
  productImageUrl: "",
  targetAmount: 459000,
  confirmedPercentage: 91,
  deadline: "2025-10-10T23:59:59",
};

describe("SurpriseDetailView", () => {
  it("'{이름}의 서프라이즈 펀딩' 제목과 진행 카드 값을 보여준다", () => {
    render(<SurpriseDetailView surprise={surprise} onBack={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /서준의\s+서프라이즈 펀딩/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "펀딩 달성률" })).toHaveAttribute(
      "aria-valuenow",
      "91",
    );
    expect(screen.getByText("목표가 459,000원")).toBeInTheDocument();
  });

  it("뒤로가기를 누르면 onBack을 호출한다", async () => {
    const onBack = vi.fn();
    render(<SurpriseDetailView surprise={surprise} onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("'롤링페이퍼 보기'를 누르기 전에는 롤링페이퍼 시트가 열려 있지 않다", () => {
    const { container } = render(<SurpriseDetailView surprise={surprise} onBack={vi.fn()} />);

    expect(container.querySelector("dialog[open]")).toBeNull();
  });

  it("'롤링페이퍼 보기'를 누르면 시트가 열리고 받은 메세지 개수를 보여준다", async () => {
    const { container } = render(<SurpriseDetailView surprise={surprise} onBack={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "롤링페이퍼 보기" }));

    expect(container.querySelector("dialog[open]")).not.toBeNull();
    expect(container.textContent).toContain("총 6개의 메세지가");
  });

  it("마감된 펀딩에서 연 롤링페이퍼 시트에는 선물 받으러 가기 버튼이 없다", async () => {
    render(<SurpriseDetailView surprise={surprise} onBack={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "롤링페이퍼 보기" }));

    expect(screen.queryByRole("button", { name: "선물 받으러 가기" })).not.toBeInTheDocument();
  });
});
