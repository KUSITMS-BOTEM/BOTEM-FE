import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DEFAULT_ERROR_MESSAGE } from "@/constants/errorMessages";
import { useCompleteOnboardingMutation } from "@/hooks/mutations/user/useCompleteOnboardingMutation";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { getSignupFlow } from "@/utils/auth/signupFlowStorage";
import PayoutAccountContainer from "@/widgets/payout-account/PayoutAccountContainer";

const push = vi.fn();
const replace = vi.fn();
const completeOnboarding = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("@/hooks/mutations/user/useCompleteOnboardingMutation");
vi.mock("@/utils/auth/signupFlowStorage");

// jsdom 정적 이미지 처리와 dialog 미구현 API를 단순 대체한다
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSignupFlow).mockReturnValue({
    step: "accountEntry",
    nickname: "보탬이",
    birthday: "01-01",
  });
  vi.mocked(useCompleteOnboardingMutation).mockReturnValue({
    mutate: completeOnboarding,
    isPending: false,
  } as unknown as ReturnType<typeof useCompleteOnboardingMutation>);
});

const fillAccount = async () => {
  await userEvent.type(screen.getByLabelText("계좌번호"), "100159014821");
  await userEvent.click(screen.getByRole("button", { name: /^은행/ }));
  await userEvent.click(await screen.findByRole("button", { name: /토스뱅크/ }));
};

describe("PayoutAccountContainer", () => {
  it("가입 흐름이 계좌 입력 단계가 아니면 프로필 확인으로 되돌린다", () => {
    vi.mocked(getSignupFlow).mockReturnValue({ step: "profile" });

    render(<PayoutAccountContainer />);

    expect(replace).toHaveBeenCalledWith("/auth/profile-check");
  });

  it("계좌번호와 은행을 모두 채우기 전에는 시작하기가 비활성화된다", async () => {
    render(<PayoutAccountContainer />);
    expect(screen.getByRole("button", { name: "시작하기" })).toBeDisabled();

    await userEvent.type(screen.getByLabelText("계좌번호"), "100159014821");

    expect(screen.getByRole("button", { name: "시작하기" })).toBeDisabled();
  });

  it("채운 뒤 시작하기를 누르면 가입 정보와 계좌로 온보딩을 완료한다", async () => {
    render(<PayoutAccountContainer />);
    await fillAccount();

    await userEvent.click(screen.getByRole("button", { name: "시작하기" }));

    expect(completeOnboarding).toHaveBeenCalledWith({
      name: "보탬이",
      birthday: "01-01",
      bank: "TOSS_BANK",
      accountNumber: "100159014821",
    });
  });

  it("가입 흐름에 닉네임이 없으면 에러를 알리고 처음으로 돌려보낸다", async () => {
    render(<PayoutAccountContainer />);
    await fillAccount();
    vi.mocked(getSignupFlow).mockReturnValue({ step: "accountEntry" });

    await userEvent.click(screen.getByRole("button", { name: "시작하기" }));

    expect(useErrorDialogStore.getState().message).toBe(DEFAULT_ERROR_MESSAGE.message);
    useErrorDialogStore.getState().closeErrorDialog();
    expect(replace).toHaveBeenCalledWith("/");
    expect(completeOnboarding).not.toHaveBeenCalled();
  });

  it("이전을 누르면 프로필 확인으로 이동한다", async () => {
    render(<PayoutAccountContainer />);

    await userEvent.click(screen.getByRole("button", { name: "이전" }));

    expect(push).toHaveBeenCalledWith("/auth/profile-check");
  });
});
