import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import { pickWheelDate } from "@/__tests__/pickWheelDate";
import SurpriseOpenSheet from "@/widgets/funding/SurpriseOpenSheet";

const { createSurprise } = vi.hoisted(() => ({ createSurprise: vi.fn() }));
vi.mock("@/hooks/mutations/funding/useCreateSurpriseFundingMutation", () => ({
  useCreateSurpriseFundingMutation: () => ({ mutateAsync: createSurprise, isPending: false }),
}));
vi.mock("@/hooks/queries/payout-account/usePayoutAccountsQuery", () => ({
  usePayoutAccountsQuery: () => ({
    data: [{ accountNumber: "100159014821", bank: "TOSS_BANK", isDefault: true }],
  }),
}));
const { push, replace } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("@/hooks/queries/user/useMyProfileQuery", () => ({
  useMyProfileQuery: () => ({ data: { name: "지유" } }),
}));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const wish = { id: 468, productName: "상품468", productImageUrl: undefined, price: 468000 };

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <SurpriseOpenSheet
      open={open}
      wish={wish}
      recipientId="7"
      recipientName="민지"
      // 2026-11-13 기준 408일 뒤가 2027-12-26이라 마감일 2027-12-25와 맞물린다
      recipientBirthday="12-26"
      recipientBirthdayDday={408}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
    />
  );
}

// 금액 → 마감일 → 생일 칩으로 공개일 → 다음까지 눌러 프로필 노출 시트를 연다
const goToExposure = async () => {
  const user = userEvent.setup();
  const amount = await screen.findByLabelText("목표 금액");
  await waitFor(() => expect(amount).toHaveFocus(), { timeout: 3000 });
  await user.type(amount, "1000");
  await user.tab();
  await user.click(screen.getByRole("button", { name: /^마감일/ }));
  await pickWheelDate(user, { year: 2027, month: 12, day: 25 });
  await user.click(screen.getByRole("button", { name: "생일 12월 26일 사용" }));
  await user.click(screen.getByRole("button", { name: "다음" }));
};

const openConfirm = async (showOnProfile: "예" | "아니오" = "아니오") => {
  render(<Harness />);
  await goToExposure();
  await userEvent.click(await screen.findByRole("button", { name: showOnProfile }));
  await userEvent.click(await screen.findByRole("button", { name: /대표 계좌 사용하기/ }));
  await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));
  await screen.findByText("이대로 서프라이즈 펀딩을 열까요?");
};

// 숨겨진 입력 단계와 구분하기 위해 확인 시트 안에서만 찾는다
const confirmSheet = () =>
  within(screen.getByText("이대로 서프라이즈 펀딩을 열까요?").closest("dialog") as HTMLElement);

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  createSurprise.mockReset();
  mockPointer("coarse");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 13));
});

afterEach(() => vi.useRealTimers());

describe("SurpriseOpenSheet 미리보기", () => {
  it("확인 시트에서 미리보기를 누르면 입력한 값이 담긴 미리보기가 열린다", async () => {
    await openConfirm();

    await userEvent.click(confirmSheet().getByRole("button", { name: "미리보기" }));

    const preview = within(await screen.findByRole("dialog", { name: "미리보기" }));
    expect(preview.getByText("민지의 서프라이즈 펀딩")).toBeInTheDocument();
    expect(preview.getByText("상품468")).toBeInTheDocument();
    expect(preview.getByText("목표가 1,000원")).toBeInTheDocument();
    expect(preview.getByRole("progressbar", { name: "펀딩 달성률" })).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
  });
});

describe("SurpriseOpenSheet", () => {
  it("펀딩 정보부터 시작한다", () => {
    render(<Harness />);

    expect(screen.getByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.getByText("목표 금액은 얼마인가요?")).toBeInTheDocument();
  });

  it("펀딩 정보에서 다음을 누르면 프로필 노출 선택 시트가 열린다", async () => {
    render(<Harness />);
    await goToExposure();

    expect(
      await screen.findByText("민지의 프로필에 서프라이즈 펀딩을 보여줄까요?"),
    ).toBeInTheDocument();
  });

  it("프로필 노출을 선택하면 계좌 단계로 넘어간다", async () => {
    render(<Harness />);
    await goToExposure();
    await userEvent.click(await screen.findByRole("button", { name: "예" }));

    expect(await screen.findByText("펀딩 계좌")).toBeInTheDocument();
    expect(screen.getByLabelText("계좌번호")).toBeInTheDocument();
  });

  it("프로필 노출 시트를 선택 없이 닫으면 계좌 단계로 넘어가지 않는다", async () => {
    render(<Harness />);
    await goToExposure();
    const sheet = await screen.findByRole("dialog", { name: "프로필 펀딩 노출" });
    await userEvent.click(within(sheet).getByRole("button", { name: "닫기" }));

    expect(screen.queryByLabelText("계좌번호")).not.toBeInTheDocument();
  });

  it("계좌 단계에서 이전을 누르면 펀딩 정보로 돌아오고 값이 남아 있다", async () => {
    render(<Harness />);
    await goToExposure();
    await userEvent.click(await screen.findByRole("button", { name: "예" }));
    await userEvent.click(await screen.findByRole("button", { name: "이전" }));

    expect(screen.getByText("펀딩 정보")).toBeInTheDocument();
    expect(screen.getByLabelText("목표 금액")).toHaveValue("1,000");
  });

  it("X를 누르면 그만둘지 묻고 그만두기를 누르면 시트를 닫는다", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.click(screen.getAllByRole("button", { name: "닫기" })[0]);
    expect(await screen.findByText("펀딩 만들기를 그만둘까요?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "그만두기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("확인 시트", () => {
    it("프로필 노출을 아니오로 골랐으면 보여주지 않기로 설정이라고 보여준다", async () => {
      await openConfirm("아니오");

      expect(confirmSheet().getByText("보여주지 않기로 설정")).toBeInTheDocument();
      expect(confirmSheet().getByText("100159014821")).toBeInTheDocument();
    });

    it("펀딩 열기를 누르면 입력한 값으로 서프라이즈 개설을 요청하고 완료 화면을 연다", async () => {
      createSurprise.mockResolvedValue({ fundingId: 8 });
      await openConfirm("아니오");

      await userEvent.click(confirmSheet().getByRole("button", { name: "펀딩 열기" }));

      expect(createSurprise).toHaveBeenCalledWith({
        recipientId: 7,
        wishId: 468,
        bank: "TOSS_BANK",
        accountNumber: "100159014821",
        targetAmount: 1000,
        deadline: "2027-12-25",
        revealAt: "2027-12-26",
        showOnRecipientProfile: false,
      });
      expect(await screen.findByText("서프라이즈가 시작됐어요!")).toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    });

    it("완료 화면 카드는 입력값이 아니라 응답의 deadline으로 마감일을 보여준다", async () => {
      createSurprise.mockResolvedValue({ fundingId: 8, deadline: "2027-12-30T23:59:59.999999" });
      await openConfirm();
      await userEvent.click(confirmSheet().getByRole("button", { name: "펀딩 열기" }));

      const completeSheet = (await screen.findByText("서프라이즈가 시작됐어요!")).closest(
        "dialog",
      ) as HTMLElement;

      expect(within(completeSheet).getByText("12월 30일까지")).toBeInTheDocument();
    });

    it("응답에 deadline이 없으면 완료 화면 카드는 입력한 마감일을 보여준다", async () => {
      createSurprise.mockResolvedValue({ fundingId: 8 });
      await openConfirm();
      await userEvent.click(confirmSheet().getByRole("button", { name: "펀딩 열기" }));

      const completeSheet = (await screen.findByText("서프라이즈가 시작됐어요!")).closest(
        "dialog",
      ) as HTMLElement;

      expect(within(completeSheet).getByText("12월 25일까지")).toBeInTheDocument();
    });

    it("완료 화면을 닫으면 응답 fundingId와 friendId를 달고 히스토리를 교체해 상세로 이동한다", async () => {
      createSurprise.mockResolvedValue({ fundingId: 8 });
      await openConfirm();
      await userEvent.click(confirmSheet().getByRole("button", { name: "펀딩 열기" }));

      const completeSheet = (await screen.findByText("서프라이즈가 시작됐어요!")).closest(
        "dialog",
      ) as HTMLElement;
      await userEvent.click(within(completeSheet).getByRole("button", { name: "닫기" }));

      expect(replace).toHaveBeenCalledWith("/funding/8?friendId=7");
      expect(push).not.toHaveBeenCalled();
    });

    it("프로필 노출 변경하기에서 예를 고르면 문구와 요청 값이 바뀐다", async () => {
      createSurprise.mockResolvedValue({ fundingId: 8 });
      await openConfirm("아니오");

      await userEvent.click(confirmSheet().getAllByRole("button", { name: "변경하기" })[1]);
      await userEvent.click(await screen.findByRole("button", { name: "예" }));

      await waitFor(() => expect(confirmSheet().getByText("보여주기로 설정")).toBeInTheDocument());
      await userEvent.click(confirmSheet().getByRole("button", { name: "펀딩 열기" }));
      expect(createSurprise).toHaveBeenCalledWith(
        expect.objectContaining({ showOnRecipientProfile: true }),
      );
    });

    it("개설 요청이 끝나기 전에는 펀딩 열기가 잠겨 더블클릭해도 한 번만 요청한다", async () => {
      createSurprise.mockReturnValue(new Promise(() => {}));
      await openConfirm();
      const confirmButton = confirmSheet().getByRole("button", { name: "펀딩 열기" });

      await userEvent.dblClick(confirmButton);

      expect(createSurprise).toHaveBeenCalledTimes(1);
      expect(confirmButton).toBeDisabled();
    });

    it("개설 요청이 실패하면 완료 화면 없이 잠금이 풀려 다시 누를 수 있다", async () => {
      createSurprise.mockRejectedValue(new Error("fail"));
      await openConfirm();
      const confirmButton = confirmSheet().getByRole("button", { name: "펀딩 열기" });

      await userEvent.click(confirmButton);

      await waitFor(() => expect(confirmButton).toBeEnabled());
      expect(screen.queryByText("서프라이즈가 시작됐어요!")).not.toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    });
  });
});
