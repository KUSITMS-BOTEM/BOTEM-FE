import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import ThankCardSentStep from "@/widgets/funding/ThankCardSentStep";

vi.mock("@/utils/saveNodeAsImage", () => ({ saveNodeAsImage: vi.fn() }));
// 미리 만들기는 usePreparedImageSave 테스트가 맡는다. 여기선 어떤 노드·파일명으로 저장하는지만 본다
vi.mock("@/hooks/usePreparedImageSave", async () => {
  const { saveNodeAsImage } = await import("@/utils/saveNodeAsImage");
  return {
    usePreparedImageSave: (ref: { current: HTMLElement | null }, filename: string) => () =>
      saveNodeAsImage(ref.current!, filename),
  };
});

const renderStep = (props: Partial<React.ComponentProps<typeof ThankCardSentStep>> = {}) =>
  render(<ThankCardSentStep recipientName="하린이" color="orange" message="고마워" {...props} />);

const shareButton = () => screen.getByRole("button", { name: "친구에게 공유하기" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThankCardSentStep", () => {
  it("받는 사람과 메시지를 보여주고 다운받기 버튼은 없다", () => {
    renderStep();

    expect(screen.getByText(/하린이에게\s*감사 카드를 보냈어요/)).toBeInTheDocument();
    expect(screen.getByText("To. 하린이")).toBeInTheDocument();
    expect(screen.getByText("고마워")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다운받기" })).not.toBeInTheDocument();
  });

  it("메시지의 줄바꿈을 그대로 보여준다", () => {
    renderStep({ message: "고마워\n사랑해" });

    const message = screen.getByText(/고마워/);
    expect(message.textContent).toBe("고마워\n사랑해");
    expect(message).toHaveClass("whitespace-pre-wrap");
  });

  it("공유를 누르면 카드 노드를 받는 사람 이름의 PNG로 공유한다", async () => {
    renderStep();

    await userEvent.click(shareButton());

    expect(saveNodeAsImage).toHaveBeenCalledWith(expect.any(HTMLElement), "하린이-감사-카드.png");
    const node = vi.mocked(saveNodeAsImage).mock.calls[0][0];
    expect(node).toHaveTextContent("To. 하린이");
    expect(node).toHaveTextContent("고마워");
  });

  it("공유에 실패하면 실패 토스트를 띄운다", async () => {
    vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
    renderStep();

    await userEvent.click(shareButton());

    expect(await screen.findByText("이미지를 공유하지 못했어요")).toBeInTheDocument();
  });

  it("공유가 끝나기 전에는 버튼이 비활성화되고 다시 눌러도 한 번만 공유하며 끝나면 다시 활성화된다", async () => {
    let finish!: () => void;
    vi.mocked(saveNodeAsImage).mockImplementationOnce(
      () => new Promise<void>(resolve => (finish = resolve)),
    );
    renderStep();

    await userEvent.click(shareButton());
    await userEvent.click(shareButton());

    expect(shareButton()).toBeDisabled();
    expect(saveNodeAsImage).toHaveBeenCalledTimes(1);

    finish();
    await waitFor(() => expect(shareButton()).toBeEnabled());
  });
});
