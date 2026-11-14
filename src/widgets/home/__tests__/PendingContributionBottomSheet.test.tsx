import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useUpdateContributionStatusMutation } from "@/hooks/mutations/contribution/useUpdateContributionStatusMutation";
import { usePendingContributionsQuery } from "@/hooks/queries/contribution/usePendingContributionsQuery";
import type { PendingContributionResponse } from "@/types/contribution/contribution";
import PendingContributionBottomSheet from "@/widgets/home/PendingContributionBottomSheet";

vi.mock("@/hooks/queries/contribution/usePendingContributionsQuery");
vi.mock("@/hooks/mutations/contribution/useUpdateContributionStatusMutation");
vi.mock("@/components/ToastMessage", () => ({
  default: ({
    show,
    text,
    buttonText,
    onButtonClick,
  }: {
    show: boolean;
    text: string;
    buttonText: string;
    onButtonClick: () => void;
  }) =>
    show ? (
      <div role="status">
        {text}
        <button onClick={onButtonClick}>{buttonText}</button>
      </div>
    ) : null,
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

const contributions: PendingContributionResponse[] = [
  { contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 2, senderName: "도윤이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 3, senderName: "서준이", depositMethod: "토스뱅크 계좌" },
];

const refetch = vi.fn();
const mutate = vi.fn();

type MutateOptions = { onSuccess?: () => void; onSettled?: () => void };

const mockQuery = (state: {
  data?: PendingContributionResponse[];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  vi.mocked(usePendingContributionsQuery).mockReturnValue({
    data: state.data ? { contributions: state.data } : undefined,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    refetch,
  } as unknown as ReturnType<typeof usePendingContributionsQuery>);
};

const renderSheet = (props: Partial<Parameters<typeof PendingContributionBottomSheet>[0]> = {}) =>
  render(<PendingContributionBottomSheet open fundingId={9} onClose={vi.fn()} {...props} />);

const lastOptions = () => mutate.mock.calls.at(-1)![1] as MutateOptions;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useUpdateContributionStatusMutation).mockReturnValue({
    mutate,
  } as unknown as ReturnType<typeof useUpdateContributionStatusMutation>);
  mockQuery({ data: contributions });
});

describe("PendingContributionBottomSheet", () => {
  it("열면 제목과 토스 확인하기 버튼을 보여주고 토스 확인하기를 누르면 onCheckToss를 호출한다", async () => {
    const onCheckToss = vi.fn();
    renderSheet({ onCheckToss });

    expect(screen.getByRole("dialog", { name: "입금 확인" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /토스 확인하기/ }));

    expect(onCheckToss).toHaveBeenCalledTimes(1);
  });

  it("open과 fundingId를 쿼리에 전달한다", () => {
    renderSheet({ open: false, fundingId: 9 });

    expect(usePendingContributionsQuery).toHaveBeenCalledWith({ fundingId: 9, enabled: false });
    expect(useUpdateContributionStatusMutation).toHaveBeenCalledWith(9);
  });

  it("보탬이 N건이면 '확인이 필요한 보탬이 N건 있어요.'를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("확인이 필요한 보탬이 3건 있어요.")).toBeInTheDocument();
  });

  it("보탬이 0건이면 '확인이 필요한 보탬을 모두 확인했어요.'를 보여준다", () => {
    mockQuery({ data: [] });
    renderSheet();

    expect(screen.getByText("확인이 필요한 보탬을 모두 확인했어요.")).toBeInTheDocument();
  });

  it("로딩 중에는 설명 문구를 보여주지 않는다", () => {
    mockQuery({ isLoading: true });
    renderSheet();

    expect(screen.queryByText(/확인이 필요한 보탬/)).not.toBeInTheDocument();
  });

  it("선택이 없으면 못받았어요와 받았어요가 비활성이다", () => {
    renderSheet();

    expect(screen.getByRole("button", { name: "못받았어요" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "받았어요" })).toBeDisabled();
  });

  it("카드를 하나 선택하면 못받았어요와 받았어요가 활성화된다", async () => {
    renderSheet();

    await userEvent.click(screen.getByText("하린이의 보탬"));

    expect(screen.getByRole("button", { name: "못받았어요" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "받았어요" })).toBeEnabled();
  });

  it("전체 선택을 체크하면 모든 카드가 선택된다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));

    const itemBoxes = screen
      .getAllByRole("checkbox")
      .filter(box => box !== screen.getByRole("checkbox", { name: "전체 선택" }));
    expect(itemBoxes).toHaveLength(3);
    itemBoxes.forEach(box => expect(box).toBeChecked());
  });

  it("전체 선택 상태에서 카드를 하나 해제하면 전체 선택도 해제된다", async () => {
    renderSheet();
    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));

    await userEvent.click(screen.getByText("하린이의 보탬"));

    expect(screen.getByRole("checkbox", { name: "전체 선택" })).not.toBeChecked();
  });

  it("보탬이 0건이면 전체 선택이 체크되지 않는다", () => {
    mockQuery({ data: [] });
    renderSheet();

    expect(screen.getByRole("checkbox", { name: "전체 선택" })).not.toBeChecked();
  });

  it("받았어요를 누르면 선택한 id와 CONFIRMED로 mutate한다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByText("서준이의 보탬"));

    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(mutate).toHaveBeenCalledWith(
      { contributionIds: [1, 3], status: "CONFIRMED" },
      expect.any(Object),
    );
  });

  it("받았어요가 성공하면 선택이 초기화되고 '{senderName}의 보탬을 받았어요' 토스트가 나온다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    act(() => lastOptions().onSuccess?.());

    expect(screen.getByRole("status")).toHaveTextContent("하린이의 보탬을 받았어요");
    expect(screen.getByRole("button", { name: "받았어요" })).toBeDisabled();
  });

  it("여러 건을 받았어요 처리하면 보탬마다 토스트가 하나씩 순서대로 쌓인다", async () => {
    renderSheet();
    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    act(() => lastOptions().onSuccess?.());

    expect(screen.getAllByRole("status").map(toast => toast.textContent)).toEqual([
      "하린이의 보탬을 받았어요취소하기",
      "도윤이의 보탬을 받았어요취소하기",
      "서준이의 보탬을 받았어요취소하기",
    ]);
  });

  it("받았어요를 이어서 누르면 이전 토스트를 대체하지 않고 아래에 새 토스트를 덧붙인다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    act(() => {
      lastOptions().onSuccess?.();
      lastOptions().onSettled?.();
    });

    await userEvent.click(screen.getByText("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    act(() => lastOptions().onSuccess?.());

    const toasts = screen.getAllByRole("status");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("하린이의 보탬을 받았어요");
    expect(toasts[1]).toHaveTextContent("도윤이의 보탬을 받았어요");
  });

  it("받았어요가 실패하면 토스트를 보여주지 않고 선택을 유지한다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    act(() => lastOptions().onSettled?.());

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "받았어요" })).toBeEnabled();
  });

  it("토스트의 취소하기를 누르면 그 보탬만 PENDING으로 되돌리고 그 토스트만 사라진다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByText("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    act(() => {
      lastOptions().onSuccess?.();
      lastOptions().onSettled?.();
    });

    const harinToast = screen.getByText("하린이의 보탬을 받았어요").closest("[role=status]")!;
    await userEvent.click(
      within(harinToast as HTMLElement).getByRole("button", { name: "취소하기" }),
    );

    expect(mutate).toHaveBeenLastCalledWith(
      { contributionIds: [1], status: "PENDING" },
      expect.any(Object),
    );
    act(() => lastOptions().onSuccess?.());
    await waitFor(() =>
      expect(screen.queryByText("하린이의 보탬을 받았어요")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("도윤이의 보탬을 받았어요")).toBeInTheDocument();
  });

  it("못받았어요가 성공하면 선택을 초기화하고 취소 가능한 토스트를 보여준다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("도윤이의 보탬"));

    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(mutate).toHaveBeenCalledWith(
      { contributionIds: [2], status: "REJECTED" },
      expect.any(Object),
    );
    act(() => lastOptions().onSuccess?.());
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("도윤이의 보탬을 못 받은 걸로 표시했어요");
    expect(screen.getByRole("button", { name: "취소하기" })).toBeInTheDocument();
  });

  it("못받았어요 토스트의 취소하기는 해당 보탬을 PENDING으로 되돌린다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));
    act(() => {
      lastOptions().onSuccess?.();
      lastOptions().onSettled?.();
    });

    await userEvent.click(screen.getByRole("button", { name: "취소하기" }));

    expect(mutate).toHaveBeenLastCalledWith(
      { contributionIds: [2], status: "PENDING" },
      expect.any(Object),
    );
    act(() => lastOptions().onSuccess?.());
    await waitFor(() =>
      expect(screen.queryByText("도윤이의 보탬을 못 받은 걸로 표시했어요")).not.toBeInTheDocument(),
    );
  });

  it("못받았어요가 실패하면 토스트를 보여주지 않고 선택을 유지한다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    act(() => lastOptions().onSettled?.());

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeEnabled();
  });

  it("요청이 진행 중일 때 버튼을 연달아 눌러도 mutate는 한 번만 호출된다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));

    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("요청이 끝나면(onSettled) 다시 요청할 수 있다", async () => {
    renderSheet();
    await userEvent.click(screen.getByText("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    act(() => lastOptions().onSettled?.());

    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it("닫으면 onClose를 호출하고 다시 열었을 때 선택이 초기화되어 있다", async () => {
    const onClose = vi.fn();
    renderSheet({ onClose });
    await userEvent.click(screen.getByText("하린이의 보탬"));

    fireEvent(screen.getByRole("dialog", { name: "입금 확인" }), new Event("close"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "받았어요" })).toBeDisabled();
  });

  it("에러 화면에서 다시 시도를 누르면 refetch를 호출한다", async () => {
    mockQuery({ isError: true });
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("확인할 보탬이 없으면 onAllConfirmed를 호출한다", () => {
    const onAllConfirmed = vi.fn();
    mockQuery({ data: [] });
    renderSheet({ onAllConfirmed });

    expect(onAllConfirmed).toHaveBeenCalled();
  });

  it("확인할 보탬이 남아 있으면 onAllConfirmed를 호출하지 않는다", () => {
    const onAllConfirmed = vi.fn();
    renderSheet({ onAllConfirmed });

    expect(onAllConfirmed).not.toHaveBeenCalled();
  });
});

describe("PendingContributionBottomSheet 토스트 타이머", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("토스트는 2500ms 후 사라진다", async () => {
    renderSheet();
    fireEvent.click(screen.getByText("하린이의 보탬"));
    fireEvent.click(screen.getByRole("button", { name: "받았어요" }));
    act(() => lastOptions().onSuccess?.());
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    // 목록에서 빠진 뒤 framer exit 애니메이션은 fake timer로 진행되지 않아 실제 시간으로 기다린다
    vi.useRealTimers();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
