import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCloseFundingMutation } from "@/hooks/mutations/funding/useCloseFundingMutation";
import SurpriseSendNowDialog from "@/widgets/home/SurpriseSendNowDialog";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/hooks/mutations/funding/useCloseFundingMutation", () => ({
  useCloseFundingMutation: vi.fn(),
}));

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

type MutateOptions = { onSuccess?: () => void; onError?: () => void };
const mutate = vi.fn<(id: number, options: MutateOptions) => void>();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCloseFundingMutation).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCloseFundingMutation>);
});

describe("SurpriseSendNowDialog", () => {
  it("fundingId가 null이면 다이얼로그가 닫혀 있다", () => {
    render(<SurpriseSendNowDialog fundingId={null} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fundingId가 있으면 제목과 두 선택지를 보여준다", () => {
    render(<SurpriseSendNowDialog fundingId={5} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "지금 선물을 보낼까요?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지금 보내기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "마감일에 보낼게요" })).toBeInTheDocument();
  });

  it("지금 보내기를 누르면 펀딩을 마감하고 성공하면 선물 준비 화면으로 이동한다", async () => {
    render(<SurpriseSendNowDialog fundingId={5} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "지금 보내기" }));

    expect(mutate).toHaveBeenCalledWith(5, expect.any(Object));
    expect(push).not.toHaveBeenCalled();
    mutate.mock.calls[0][1].onSuccess?.();
    expect(push).toHaveBeenCalledWith("/funding/5/surprise-gift");
  });

  it("지금 보내기를 연타해도 마감 요청은 한 번만 보낸다", async () => {
    render(<SurpriseSendNowDialog fundingId={5} onClose={vi.fn()} />);
    const button = screen.getByRole("button", { name: "지금 보내기" });

    await userEvent.dblClick(button);

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("마감 요청이 실패하면 다시 지금 보내기를 눌러 재시도할 수 있다", async () => {
    render(<SurpriseSendNowDialog fundingId={5} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "지금 보내기" }));

    mutate.mock.calls[0][1].onError?.();
    await userEvent.click(await screen.findByRole("button", { name: "지금 보내기" }));

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(push).not.toHaveBeenCalled();
  });

  it("마감 요청 중에는 마감일에 보낼게요를 눌러도 onClose를 호출하지 않는다", async () => {
    const onClose = vi.fn();
    render(<SurpriseSendNowDialog fundingId={5} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "지금 보내기" }));

    await userEvent.click(screen.getByRole("button", { name: "마감일에 보낼게요" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("요청 전에 마감일에 보낼게요를 누르면 마감 없이 onClose를 호출한다", async () => {
    const onClose = vi.fn();
    render(<SurpriseSendNowDialog fundingId={5} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "마감일에 보낼게요" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
