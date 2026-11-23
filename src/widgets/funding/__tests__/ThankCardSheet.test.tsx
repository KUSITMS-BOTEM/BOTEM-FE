import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useSendThankCardMutation } from "@/hooks/mutations/contribution/useSendThankCardMutation";
import { ApiError } from "@/types/api";
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
    onDepositUnconfirmed={props.onDepositUnconfirmed ?? vi.fn()}
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

// 닫힌 Dialog도 DOM에 남아 있어 <dialog>의 open 속성으로 노출 여부를 본다
const isDepositNoticeOpen = () =>
  (screen.getByText("입금을 먼저 확인해주세요").closest("dialog") as HTMLDialogElement).open;

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

describe("ThankCardSheet 보내기", () => {
  it("보내기를 누르면 trim한 메시지와 대문자 편지지 색으로 mutate를 호출한다", async () => {
    renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "핑크" }));

    await goToSentStep(" 고마워 ");

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      { fundingId: 5, contributionId: 31, message: "고마워", paperColor: "PINK" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
    );
  });

  it("색을 바꾸지 않으면 기본 편지지 색 ORANGE로 mutate를 호출한다", async () => {
    renderSheet();

    await goToSentStep("고마워");

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ paperColor: "ORANGE" }),
      expect.anything(),
    );
  });

  it("전송 성공 전에는 작성 화면에 머문다", async () => {
    renderSheet();

    await goToSentStep("고마워");

    expect(textarea()).toBeInTheDocument();
    expect(screen.queryByText(/감사 카드를 보냈어요/)).not.toBeInTheDocument();
  });

  it("전송 중이면 보내기 버튼이 로딩 상태로 비활성화된다", () => {
    isPending = true;
    mockMutation();
    renderSheet();

    expect(sendButton()).toBeDisabled();
    expect(sendButton()).toHaveAttribute("aria-busy", "true");
  });

  it("입금 미확인(FUNDING_049)이면 안내 Dialog를 띄우고 확인하면 onDepositUnconfirmed를 호출한다", async () => {
    mutate.mockImplementation((_vars, options) =>
      options.onError(new ApiError("FUNDING_049", "입금 미확인")),
    );
    const onDepositUnconfirmed = vi.fn();
    renderSheet({ onDepositUnconfirmed });
    await goToSentStep("고마워");

    await waitFor(() => expect(isDepositNoticeOpen()).toBe(true));
    expect(onDepositUnconfirmed).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onDepositUnconfirmed).toHaveBeenCalledTimes(1);
    expect(isDepositNoticeOpen()).toBe(false);
  });

  it("그 외 에러는 안내 Dialog 없이 작성 화면에 머문다", async () => {
    mutate.mockImplementation((_vars, options) => options.onError(new ApiError("FUNDING_023")));
    const onDepositUnconfirmed = vi.fn();
    renderSheet({ onDepositUnconfirmed });

    await goToSentStep("고마워");

    expect(isDepositNoticeOpen()).toBe(false);
    expect(onDepositUnconfirmed).not.toHaveBeenCalled();
    expect(textarea()).toBeInTheDocument();
  });
});

describe("ThankCardSheet 완료 단계", () => {
  const goToSentStepWithSuccess = async (message: string) => {
    mutate.mockImplementation((_vars, options) => options.onSuccess());
    await goToSentStep(message);
  };

  it("전송에 성공하면 완료 화면으로 넘어가고 다운받기 버튼은 없다", async () => {
    renderSheet();

    await goToSentStepWithSuccess("고마워");

    expect(screen.getByText(/하린이에게\s*감사 카드를 보냈어요/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다운받기" })).not.toBeInTheDocument();
  });

  it("완료 카드에 앞뒤 공백을 제거한 메시지를 보여준다", async () => {
    renderSheet();

    await goToSentStepWithSuccess("  고마워  ");

    expect(screen.getByText("고마워").textContent).toBe("고마워");
  });

  it("요청 중 입력을 바꿔도 완료 카드에는 보낸 시점의 메시지를 보여준다", async () => {
    let onSuccess: () => void = () => {};
    mutate.mockImplementation((_vars, options) => {
      onSuccess = options.onSuccess;
    });
    renderSheet();

    await goToSentStep("고마워");
    await userEvent.type(textarea(), " 바뀐 글");
    act(() => onSuccess());

    expect(screen.getByText("고마워")).toBeInTheDocument();
    expect(screen.queryByText(/바뀐 글/)).not.toBeInTheDocument();
  });

  it("공유하기를 누르면 API 호출 없이 카드를 받는 사람 이름의 PNG로 공유한다", async () => {
    renderSheet();
    await goToSentStepWithSuccess("고마워");
    mutate.mockClear();

    await userEvent.click(shareButton());

    expect(saveNodeAsImage).toHaveBeenCalledWith(expect.any(HTMLElement), "하린이-감사-카드.png");
    const sharedNode = vi.mocked(saveNodeAsImage).mock.calls[0][0];
    expect(sharedNode).toHaveTextContent("To. 하린이");
    expect(sharedNode).toHaveTextContent("고마워");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("이미지 공유에 실패하면 실패 토스트를 띄운다", async () => {
    vi.mocked(saveNodeAsImage).mockRejectedValueOnce(new Error("fail"));
    renderSheet();
    await goToSentStepWithSuccess("고마워");

    await userEvent.click(shareButton());

    expect(await screen.findByText("이미지를 공유하지 못했어요")).toBeInTheDocument();
  });

  it("공유가 끝나기 전에는 버튼이 비활성화되고 다시 눌러도 한 번만 공유한다", async () => {
    let finishShare!: () => void;
    vi.mocked(saveNodeAsImage).mockImplementationOnce(
      () => new Promise<void>(resolve => (finishShare = resolve)),
    );
    renderSheet();
    await goToSentStepWithSuccess("고마워");

    await userEvent.click(shareButton());
    await userEvent.click(shareButton());

    expect(shareButton()).toBeDisabled();
    expect(saveNodeAsImage).toHaveBeenCalledTimes(1);

    finishShare();
    await waitFor(() => expect(shareButton()).toBeEnabled());
  });

  it("이미지 공유에 실패해도 버튼이 다시 활성화된다", async () => {
    let failShare!: () => void;
    vi.mocked(saveNodeAsImage).mockImplementationOnce(
      () => new Promise<void>((_resolve, reject) => (failShare = () => reject(new Error("fail")))),
    );
    renderSheet();
    await goToSentStepWithSuccess("고마워");
    await userEvent.click(shareButton());
    expect(shareButton()).toBeDisabled();

    failShare();

    await waitFor(() => expect(shareButton()).toBeEnabled());
  });
});
