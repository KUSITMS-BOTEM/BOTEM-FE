import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { DepositItem } from "@/utils/funding/depositConfirm";
import { openTossApp } from "@/utils/funding/openTossApp";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";

vi.mock("@/utils/funding/openTossApp");
vi.mock("@/components/ToastMessage", () => ({
  default: ({
    show,
    text,
    buttonText,
    onButtonClick,
  }: {
    show: boolean;
    text: string;
    buttonText?: string;
    onButtonClick?: () => void;
  }) =>
    show ? (
      <div role="status">
        {text}
        {buttonText && <button onClick={onButtonClick}>{buttonText}</button>}
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

const deposits: DepositItem[] = [
  { id: 1, senderName: "하린이", amount: 45000, depositedAt: "2026-11-18T11:20:00" },
  { id: 2, senderName: "도윤이", amount: 30000, depositedAt: "2026-11-16T09:05:00" },
  { id: 3, senderName: "서준이", amount: 10000, depositedAt: "2026-11-16T08:00:00" },
];

const renderSheet = (props: Partial<Parameters<typeof DepositConfirmSheet>[0]> = {}) =>
  render(<DepositConfirmSheet open deposits={deposits} onClose={vi.fn()} {...props} />);

const checkbox = (name: string) => screen.getByRole("checkbox", { name: new RegExp(name) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DepositConfirmSheet 목록", () => {
  it("날짜별로 묶어 보내는 사람·시간·금액을 보여주고 건수는 목록 개수다", () => {
    renderSheet();

    expect(screen.getByRole("dialog", { name: "입금 확인" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "입금 확인 3건" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "11월 18일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "11월 16일" })).toBeInTheDocument();
    expect(checkbox("도윤이의 보탬")).toHaveAccessibleName(/09:05/);
    expect(checkbox("도윤이의 보탬")).toHaveAccessibleName(/30,000원/);
  });

  it("선택하기 전에는 받았어요·못받았어요가 비활성이고, 하나 선택하면 활성화된다", async () => {
    renderSheet();
    expect(screen.getByRole("button", { name: "받았어요" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeDisabled();

    await userEvent.click(checkbox("하린이의 보탬"));

    expect(screen.getByRole("button", { name: "받았어요" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "못받았어요" })).toBeEnabled();
  });

  it("전체 선택을 누르면 모든 행이 선택되고, 다시 누르면 모두 해제된다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    deposits.forEach(({ senderName }) => expect(checkbox(`${senderName}의 보탬`)).toBeChecked());

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    deposits.forEach(({ senderName }) =>
      expect(checkbox(`${senderName}의 보탬`)).not.toBeChecked(),
    );
  });
});

describe("DepositConfirmSheet 처리와 토스트", () => {
  it("개별 선택 후 받았어요를 누르면 목록에서 빠지고 'n건의 입금을 모두 확인했어요'를 보여준다", async () => {
    renderSheet();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(screen.getByText(/1건의 입금을 모두 확인했어요/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /하린이의 보탬/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "입금 확인 2건" })).toBeInTheDocument();
  });

  it("개별 선택 후 못받았어요를 누르면 'n건의 입금을 못받음 처리했어요'를 보여준다", async () => {
    renderSheet();

    await userEvent.click(checkbox("하린이의 보탬"));
    await userEvent.click(checkbox("도윤이의 보탬"));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(screen.getByText(/2건의 입금을 못받음 처리했어요/)).toBeInTheDocument();
  });

  it("모두 선택하고 받았어요를 누르면 '모든 건의 입금을 확인했어요'와 빈 상태를 보여준다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));

    expect(screen.getByText(/모든 건의 입금을 확인했어요/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "입금 확인 0건" })).toBeInTheDocument();
    expect(screen.getByText("모든 내역을 확인했어요")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "전체 선택" })).toBeDisabled();
  });

  it("모두 선택하고 못받았어요를 누르면 '모든 건의 입금을 못받음 처리했어요'를 보여준다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "못받았어요" }));

    expect(screen.getByText(/모든 건의 입금을 못받음 처리했어요/)).toBeInTheDocument();
  });

  it("실행 취소를 누르면 처리한 행이 목록으로 돌아오고 선택은 해제된 상태다", async () => {
    renderSheet();

    await userEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    await userEvent.click(screen.getByRole("button", { name: "받았어요" }));
    await userEvent.click(screen.getByRole("button", { name: "실행 취소" }));

    expect(screen.getByRole("heading", { name: "입금 확인 3건" })).toBeInTheDocument();
    deposits.forEach(({ senderName }) =>
      expect(checkbox(`${senderName}의 보탬`)).not.toBeChecked(),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("DepositConfirmSheet 토스 확인하기", () => {
  it("앱이 열리지 않으면 모바일에서 열어달라는 안내를 보여준다", async () => {
    vi.mocked(openTossApp).mockResolvedValue(false);
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /토스 확인하기/ }));

    expect(await screen.findByText(/모바일에서 토스 앱을 열어/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "실행 취소" })).not.toBeInTheDocument();
  });

  it("앱이 열리면 안내를 보여주지 않는다", async () => {
    vi.mocked(openTossApp).mockResolvedValue(true);
    renderSheet();

    await userEvent.click(screen.getByRole("button", { name: /토스 확인하기/ }));

    expect(openTossApp).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
