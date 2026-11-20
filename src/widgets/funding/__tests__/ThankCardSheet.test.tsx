import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useSendThankCardMutation } from "@/hooks/mutations/contribution/useSendThankCardMutation";
import { saveNodeAsImage } from "@/utils/saveNodeAsImage";
import ThankCardSheet from "@/widgets/funding/ThankCardSheet";

vi.mock("@/hooks/mutations/contribution/useSendThankCardMutation", () => ({
  useSendThankCardMutation: vi.fn(),
}));
vi.mock("@/utils/saveNodeAsImage", () => ({ saveNodeAsImage: vi.fn() }));

const mutate = vi.fn();
let isPending = false;

const mockMutation = () => {
  vi.mocked(useSendThankCardMutation).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useSendThankCardMutation>);
};

const buildSheet = (props: Partial<React.ComponentProps<typeof ThankCardSheet>> = {}) => (
  <ThankCardSheet
    open
    fundingId={5}
    contributionId={31}
    recipientName="하린이"
    onClose={props.onClose ?? vi.fn()}
    {...props}
  />
);

const renderSheet = (props: Partial<React.ComponentProps<typeof ThankCardSheet>> = {}) => {
  const onClose = props.onClose ?? vi.fn();
  const view = render(buildSheet({ ...props, onClose }));
  return { onClose, ...view };
};

const textarea = () => screen.getByRole("textbox", { name: "감사 카드 내용" });
const sendButton = () => screen.getByRole("button", { name: "보내기" });
const shareButton = () => screen.getByRole("button", { name: "친구에게 공유하기" });

const goToSentStep = async (message: string) => {
  await userEvent.type(textarea(), message);
  await userEvent.click(sendButton());
};

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks는 구현을 지우지 않아 성공 케이스의 mockImplementation이 다음 테스트로 새어 나간다
  mutate.mockReset();
  isPending = false;
  mockMutation();
});

describe("ThankCardSheet 작성 단계", () => {
  it("제목과 받는 사람, 기본 주황 팔레트, 0/50 카운터를 보여주고 플러스 버튼과 툴팁은 없다", () => {
    renderSheet();

    expect(screen.getByText("감사 카드")).toBeInTheDocument();
    expect(screen.getByText("To. 하린이")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "주황" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("/50")).toHaveTextContent("/50");
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "나만의 편지 만들기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("글이 비어 있으면 보내기 버튼이 비활성화된다", () => {
    renderSheet();

    expect(sendButton()).toBeDisabled();
  });

  it("공백만 입력하면 보내기 버튼이 비활성화된다", async () => {
    renderSheet();

    await userEvent.type(textarea(), "   ");

    expect(sendButton()).toBeDisabled();
  });

  it("글을 입력하면 보내기 버튼이 활성화되고 카운터가 글자 수를 보여준다", async () => {
    renderSheet();

    await userEvent.type(textarea(), "고마워");

    expect(sendButton()).toBeEnabled();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("글자 수 제한이 50자다", () => {
    renderSheet();

    expect(textarea()).toHaveAttribute("maxlength", "50");
  });

  it("추천 칩을 누르면 기존 글 끝 공백을 지우고 공백 하나를 둔 뒤 이어붙인다", async () => {
    renderSheet();
    await userEvent.type(textarea(), "안녕   ");

    await userEvent.click(screen.getByRole("button", { name: "고마워" }));

    expect(textarea()).toHaveValue("안녕 고마워");
  });

  it("글이 비어 있을 때 추천 칩을 누르면 칩 문구만 들어간다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "너가 최고야" }));

    expect(textarea()).toHaveValue("너가 최고야");
  });

  it("이어붙인 결과가 50자를 넘으면 50자에서 자른다", async () => {
    renderSheet();
    await userEvent.type(textarea(), "가".repeat(48));

    await userEvent.click(screen.getByRole("button", { name: "꼭 인증할게!" }));

    expect(textarea()).toHaveValue(`${"가".repeat(48)} 꼭`);
    expect((textarea() as HTMLTextAreaElement).value).toHaveLength(50);
  });

  it("추천 칩은 눌림 상태(aria-pressed)를 갖지 않는다", () => {
    renderSheet();

    expect(screen.getByRole("button", { name: "고마워" })).not.toHaveAttribute("aria-pressed");
  });

  it("팔레트에서 색을 고르면 해당 색이 눌림 상태가 된다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "파랑" }));

    expect(screen.getByRole("button", { name: "파랑" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "주황" })).toHaveAttribute("aria-pressed", "false");
  });

  it("open이 false이면 시트 내용을 보여주지 않는다", () => {
    renderSheet({ open: false });

    expect(screen.queryByRole("textbox", { name: "감사 카드 내용" })).not.toBeInTheDocument();
  });
});

describe("ThankCardSheet 완료 단계", () => {
  it("보내기를 누르면 API 호출 없이 완료 화면으로 넘어간다", async () => {
    renderSheet();

    await goToSentStep("고마워");

    expect(screen.getByText(/하린이에게\s*감사 카드를 보냈어요/)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("완료 카드에 앞뒤 공백을 제거한 메시지를 보여준다", async () => {
    renderSheet();

    await goToSentStep("  고마워  ");

    expect(screen.getByText("고마워")).toBeInTheDocument();
    expect(screen.getByText("고마워").textContent).toBe("고마워");
  });

  it("공유하기를 누르면 trim한 메시지와 대문자 편지지 색으로 mutate를 호출한다", async () => {
    renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "핑크" }));
    await goToSentStep(" 고마워 ");

    await userEvent.click(shareButton());

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      { fundingId: 5, contributionId: 31, message: "고마워", paperColor: "PINK" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("색을 바꾸지 않으면 기본 편지지 색 ORANGE로 mutate를 호출한다", async () => {
    renderSheet();
    await goToSentStep("고마워");

    await userEvent.click(shareButton());

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ paperColor: "ORANGE" }),
      expect.anything(),
    );
  });

  it("공유에 성공하면 onClose가 호출된다", async () => {
    mutate.mockImplementation((_vars, options) => options.onSuccess());
    const { onClose } = renderSheet();
    await goToSentStep("고마워");

    await userEvent.click(shareButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("공유에 실패하면 onClose가 호출되지 않고 요청이 끝난 뒤 버튼이 다시 활성화된다", async () => {
    const { onClose, rerender } = renderSheet();
    await goToSentStep("고마워");
    await userEvent.click(shareButton());

    isPending = true;
    mockMutation();
    rerender(buildSheet({ onClose }));
    expect(shareButton()).toBeDisabled();

    isPending = false;
    mockMutation();
    rerender(buildSheet({ onClose }));

    expect(onClose).not.toHaveBeenCalled();
    expect(shareButton()).toBeEnabled();
  });

  it("전송 중이면 공유 버튼이 로딩 상태로 비활성화된다", async () => {
    const { onClose, rerender } = renderSheet();
    await goToSentStep("고마워");

    isPending = true;
    mockMutation();
    rerender(buildSheet({ onClose }));

    expect(shareButton()).toBeDisabled();
    expect(shareButton()).toHaveAttribute("aria-busy", "true");
  });

  it("다운받기를 누르면 카드를 받는 사람 이름의 PNG로 저장한다", async () => {
    renderSheet();
    await goToSentStep("고마워");

    await userEvent.click(screen.getByRole("button", { name: "다운받기" }));

    expect(saveNodeAsImage).toHaveBeenCalledWith(expect.any(HTMLElement), "하린이-감사-카드.png");
    const savedNode = vi.mocked(saveNodeAsImage).mock.calls[0][0];
    expect(savedNode).toHaveTextContent("To. 하린이");
    expect(savedNode).toHaveTextContent("고마워");
  });

  it("이미지 저장에 실패하면 실패 토스트를 띄운다", async () => {
    vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
    renderSheet();
    await goToSentStep("고마워");

    await userEvent.click(screen.getByRole("button", { name: "다운받기" }));

    expect(await screen.findByText("이미지를 저장하지 못했어요")).toBeInTheDocument();
  });
});
