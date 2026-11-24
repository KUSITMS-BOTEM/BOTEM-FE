import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
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
  it("메시지의 줄바꿈을 그대로 보여준다", () => {
    renderStep({ message: "고마워\n사랑해" });

    const message = screen.getByText(/고마워/);
    expect(message.textContent).toBe("고마워\n사랑해");
    expect(message).toHaveClass("whitespace-pre-wrap");
  });

  it("다운받기 버튼 없이 공유하기 버튼만 보여준다", () => {
    renderStep();

    expect(screen.queryByRole("button", { name: "다운받기" })).not.toBeInTheDocument();
    expect(shareButton()).toBeInTheDocument();
  });

  it("공유하기를 누르면 카드 노드와 받는 사람 이름이 들어간 파일명으로 saveNodeAsImage를 호출한다", async () => {
    renderStep({ recipientName: "민수", message: "최고야" });

    await userEvent.click(shareButton());

    expect(saveNodeAsImage).toHaveBeenCalledWith(expect.any(HTMLElement), "민수-감사-카드.png");
    const sharedNode = vi.mocked(saveNodeAsImage).mock.calls[0][0];
    expect(sharedNode).toHaveTextContent("To. 민수");
    expect(sharedNode).toHaveTextContent("최고야");
  });

  it("공유에 실패하면 실패 토스트를 띄우고 2초 뒤 사라진다", async () => {
    vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
    renderStep();

    await userEvent.click(shareButton());

    const toast = await screen.findByText("이미지를 공유하지 못했어요");
    await waitForElementToBeRemoved(toast, { timeout: 4000 });
  });
});
