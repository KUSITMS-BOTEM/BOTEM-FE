import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type { MyProfile } from "@/types/user/profile";
import MyProfileSheet from "@/widgets/user/MyProfileSheet";

const replace = vi.fn();
const withdraw = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), replace }) }));
vi.mock("@/hooks/mutations/user/useWithdrawMutation");
vi.mock("@/hooks/queries/user/useMyProfileQuery");
vi.mock("@/widgets/user/ConnectedAccountBottomSheet", () => ({
  default: ({ open, email }: { open: boolean; email: string | null }) =>
    open ? <div>연결된 계정 시트 {email}</div> : null,
}));

const PROFILE: MyProfile = {
  nickname: "지유",
  profileImageUrl: null,
  birthday: "10-13",
  wishProfileUrl: "https://botem.site/@jiyu",
  kakaoConnected: true,
  email: "jiyu@kakao.com",
  joinedAt: "2025-01-01",
};

const mockProfile = (profile: MyProfile) =>
  vi
    .mocked(useMyProfileQuery)
    .mockReturnValue({ data: profile } as unknown as ReturnType<typeof useMyProfileQuery>);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const onClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useWithdrawMutation).mockReturnValue({ mutate: withdraw } as unknown as ReturnType<
    typeof useWithdrawMutation
  >);
  mockProfile(PROFILE);
});

describe("MyProfileSheet", () => {
  it("위시 프로필 링크를 프로토콜 없이 보여주고, 링크 복사 시 전체 URL을 클립보드에 쓴다", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<MyProfileSheet open onClose={onClose} />);

    expect(screen.getByText("botem.site/@jiyu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "링크 복사" }));

    expect(writeText).toHaveBeenCalledWith("https://botem.site/@jiyu");
  });

  it("위시 프로필 링크가 없으면 링크 복사 버튼이 비활성이다", () => {
    mockProfile({ ...PROFILE, wishProfileUrl: "" });
    render(<MyProfileSheet open onClose={onClose} />);

    expect(screen.getByRole("button", { name: "링크 복사" })).toBeDisabled();
  });

  it("이름·생일 행은 각 수정 시트를 연다", async () => {
    render(<MyProfileSheet open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "이름" }));
    expect(screen.getByRole("dialog", { name: "이름 수정" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    await userEvent.click(screen.getByRole("button", { name: "생일" }));
    expect(screen.getByRole("dialog", { name: "생일 수정" })).toBeInTheDocument();
  });

  it("연결된 계정을 누르면 연결된 계정 시트가 열린다", async () => {
    render(<MyProfileSheet open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "연결된 계정" }));

    expect(screen.getByText("연결된 계정 시트 jiyu@kakao.com")).toBeInTheDocument();
  });

  it("닫기를 누르면 onClose를 호출한다", async () => {
    render(<MyProfileSheet open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("회원 탈퇴에 성공하면 랜딩으로 이동한다", async () => {
    withdraw.mockImplementation((_, options) => options.onSuccess());
    render(<MyProfileSheet open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "회원 탈퇴" }));

    expect(withdraw).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });
});
