import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ThankCardWriteStep from "@/widgets/funding/ThankCardWriteStep";

const renderStep = (props: Partial<React.ComponentProps<typeof ThankCardWriteStep>> = {}) => {
  const handlers = {
    onColorChange: vi.fn(),
    onMessageChange: vi.fn(),
    onSend: vi.fn(),
  };
  render(
    <ThankCardWriteStep
      recipientName="하린이"
      color="orange"
      message="고마워"
      isSending={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

const sendButton = () => screen.getByRole("button", { name: "보내기" });

describe("ThankCardWriteStep", () => {
  it("글이 비어 있으면 보내기 버튼이 비활성화된다", () => {
    renderStep({ message: "" });

    expect(sendButton()).toBeDisabled();
  });

  it("공백만 있으면 보내기 버튼이 비활성화된다", () => {
    renderStep({ message: "   " });

    expect(sendButton()).toBeDisabled();
  });

  it("글이 있으면 보내기를 눌렀을 때 onSend를 호출한다", async () => {
    const { onSend } = renderStep();

    await userEvent.click(sendButton());

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("전송 중이면 보내기 버튼이 로딩 상태로 비활성화되어 onSend를 호출하지 않는다", async () => {
    const { onSend } = renderStep({ isSending: true });

    expect(sendButton()).toBeDisabled();
    expect(sendButton()).toHaveAttribute("aria-busy", "true");
    await userEvent.click(sendButton());

    expect(onSend).not.toHaveBeenCalled();
  });

  it("추천 칩을 누르면 기존 글에 이어붙인 문구를 onMessageChange로 전달한다", async () => {
    const { onMessageChange } = renderStep({ message: "안녕" });

    await userEvent.click(screen.getByRole("button", { name: "너가 최고야" }));

    expect(onMessageChange).toHaveBeenCalledWith("안녕 너가 최고야");
  });

  it("이어붙인 결과가 50자를 넘으면 50자에서 잘라 전달한다", async () => {
    const { onMessageChange } = renderStep({ message: "가".repeat(48) });

    await userEvent.click(screen.getByRole("button", { name: "꼭 인증할게!" }));

    const [passed] = onMessageChange.mock.calls[0] as [string];
    expect(passed).toHaveLength(50);
  });

  it("팔레트에서 색을 고르면 onColorChange를 호출한다", async () => {
    const { onColorChange } = renderStep();

    await userEvent.click(screen.getByRole("button", { name: "파랑" }));

    expect(onColorChange).toHaveBeenCalledWith("blue");
  });
});
