import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SurpriseConfirmSheet from "@/widgets/funding/SurpriseConfirmSheet";

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

const wish = {
  id: 1,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://example.com/1.png",
  price: 468000,
};
const info = { targetAmount: "429000", deadline: "2099-11-13", revealDate: "2099-11-14" };
const account = { accountNumber: "100159014821", bank: "TOSS_BANK" } as const;

const renderSheet = (props = {}) =>
  render(
    <SurpriseConfirmSheet
      open
      wish={wish}
      recipientName="민지"
      info={info}
      account={account}
      showOnRecipientProfile
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      onPreview={vi.fn()}
      onEditInfo={vi.fn()}
      onEditExposure={vi.fn()}
      onEditAccount={vi.fn()}
      {...props}
    />,
  );

describe("SurpriseConfirmSheet", () => {
  it("펀딩 정보·공개일·계좌를 보여준다", () => {
    renderSheet();

    expect(screen.getByText("이대로 서프라이즈 펀딩을 열까요?")).toBeInTheDocument();
    expect(screen.getByText("소니 WH-1000XM5")).toBeInTheDocument();
    expect(screen.getByText("목표 429,000원")).toBeInTheDocument();
    expect(screen.getByText(/^2099\.11\.13/)).toBeInTheDocument();
    expect(screen.getByText(/^2099\.11\.14.*\/ 밤 12시$/)).toBeInTheDocument();
    expect(screen.getByText("토스뱅크")).toBeInTheDocument();
    expect(screen.getByText("100159014821")).toBeInTheDocument();
  });

  it("보여주기로 했으면 받는 사람 프로필 문구를 보여준다", () => {
    renderSheet({ showOnRecipientProfile: true });

    expect(screen.getByText("보여주기로 설정")).toBeInTheDocument();
    expect(
      screen.getByText("민지의 프로필에 들른 다른 친구들도 펀딩을 볼 수 있어요"),
    ).toBeInTheDocument();
  });

  it("보여주지 않기로 했으면 문구가 바뀐다", () => {
    renderSheet({ showOnRecipientProfile: false });

    expect(screen.getByText("보여주지 않기로 설정")).toBeInTheDocument();
    expect(screen.queryByText("보여주기로 설정")).not.toBeInTheDocument();
    expect(screen.queryByText(/들른 다른 친구들도/)).not.toBeInTheDocument();
  });

  it("각 영역의 변경하기가 해당 수정 콜백을 호출한다", async () => {
    const onEditInfo = vi.fn();
    const onEditExposure = vi.fn();
    const onEditAccount = vi.fn();
    renderSheet({ onEditInfo, onEditExposure, onEditAccount });
    const [info, showOnProfile, account] = screen.getAllByRole("button", { name: "변경하기" });

    await userEvent.click(info);
    await userEvent.click(showOnProfile);
    await userEvent.click(account);

    expect(onEditInfo).toHaveBeenCalledTimes(1);
    expect(onEditExposure).toHaveBeenCalledTimes(1);
    expect(onEditAccount).toHaveBeenCalledTimes(1);
  });

  it("펀딩 열기를 누르면 onConfirm을 호출한다", async () => {
    const onConfirm = vi.fn();
    renderSheet({ onConfirm });

    await userEvent.click(screen.getByRole("button", { name: "펀딩 열기" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("미리보기를 누르면 onPreview를 호출한다", async () => {
    const onPreview = vi.fn();
    renderSheet({ onPreview });

    await userEvent.click(screen.getByRole("button", { name: "미리보기" }));

    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it("개설 요청 중에는 변경하기가 비활성화된다", () => {
    renderSheet({ submitting: true });

    screen.getAllByRole("button", { name: "변경하기" }).forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
