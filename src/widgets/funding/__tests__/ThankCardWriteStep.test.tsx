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
  it("보내기를 누르면 onSend가 한 번 호출된다", async () => {
    const { onSend } = renderStep();

    await userEvent.click(sendButton());

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("전송 중이면 보내기 버튼이 로딩 상태로 비활성화되어 눌러도 onSend가 호출되지 않는다", async () => {
    const { onSend } = renderStep({ isSending: true });

    await userEvent.click(sendButton());

    expect(sendButton()).toBeDisabled();
    expect(sendButton()).toHaveAttribute("aria-busy", "true");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("메시지가 공백뿐이면 보내기 버튼이 비활성화되어 눌러도 onSend가 호출되지 않는다", async () => {
    const { onSend } = renderStep({ message: "   " });

    await userEvent.click(sendButton());

    expect(sendButton()).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("추천 칩을 누르면 기존 메시지 뒤에 문구를 이어붙인 값으로 onMessageChange가 호출된다", async () => {
    const { onMessageChange } = renderStep({ message: "안녕 " });

    await userEvent.click(screen.getByRole("button", { name: "고마워" }));

    expect(onMessageChange).toHaveBeenCalledWith("안녕 고마워");
  });

  it("팔레트에서 다른 색을 누르면 해당 색으로 onColorChange가 호출된다", async () => {
    const { onColorChange } = renderStep();

    await userEvent.click(screen.getByRole("button", { name: "파랑" }));

    expect(onColorChange).toHaveBeenCalledWith("blue");
  });
});
