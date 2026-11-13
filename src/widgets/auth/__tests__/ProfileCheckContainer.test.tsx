import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockPointer } from "@/__tests__/mockPointer";
import { pickWheelDate } from "@/__tests__/pickWheelDate";
import { authService } from "@/apis/auth/authService";
import { userService } from "@/apis/user/userService";
import { useAuthStore } from "@/store/authStore";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import type { MyProfile } from "@/types/user/profile";
import { setSignupFlow } from "@/utils/auth/signupFlowStorage";
import ProfileCheckContainer from "@/widgets/auth/ProfileCheckContainer";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    getMyProfile: vi.fn(),
  },
}));

vi.mock("@/apis/auth/authService", () => ({
  authService: {
    postLogout: vi.fn(),
  },
}));

const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

const uploadProfileImageMock = vi.fn();
const uploadMutationState = { isPending: false };
vi.mock("@/hooks/mutations/user/useUploadProfileImageMutation", () => ({
  useUploadProfileImageMutation: () => ({
    mutate: uploadProfileImageMock,
    isPending: uploadMutationState.isPending,
  }),
}));

const mockProfile: MyProfile = {
  nickname: "지유",
  profileImageUrl: null,
  birthday: "10-13",
  wishProfileUrl: "https://example.com/wish",
  kakaoConnected: true,
  email: "jiyu@kakao.com",
  joinedAt: "2026-01-01",
};

// profile 조회가 끝나기 전 상태(초기 state)를 그대로 검증하고 싶은 테스트에서 사용 — 영원히 pending
const pendingProfilePromise = () => new Promise<MyProfile>(() => {});

const renderContainer = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return render(createElement(ProfileCheckContainer), { wrapper: Wrapper });
};

// jsdom에는 URL.createObjectURL/revokeObjectURL·createImageBitmap이 구현되어 있지 않아 Profile 내부 동작이 항상 성공하도록 스텁한다
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
  global.createImageBitmap = vi.fn(() =>
    Promise.resolve({ close: vi.fn() }),
  ) as unknown as typeof createImageBitmap;
});

beforeEach(() => {
  mockPointer("coarse");
  sessionStorage.clear();
  vi.clearAllMocks();
  uploadMutationState.isPending = false;
});

afterEach(() => {
  useAuthStore.setState({ accessToken: null });
});

describe("ProfileCheckContainer", () => {
  it("signupFlow가 없으면 '/'로 리다이렉트된다", () => {
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());

    renderContainer();

    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("signupFlow에 저장된 수정값이 profile 조회 결과보다 우선 표시된다", async () => {
    setSignupFlow({ step: "profile", nickname: "수정이름", birthday: "03-05" });
    vi.mocked(userService.getMyProfile).mockResolvedValue(mockProfile);

    renderContainer();

    await waitFor(() => expect(screen.getByDisplayValue("수정이름")).toBeInTheDocument());
    expect(screen.getByText("3월 5일")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("프로필 조회로 받은 생일이 달력에 선택된 상태로 열린다 (마우스 환경)", async () => {
    mockPointer("fine");
    setSignupFlow({ step: "profile", nickname: "지유" });
    vi.mocked(userService.getMyProfile).mockResolvedValue(mockProfile);
    const user = userEvent.setup();

    renderContainer();
    await user.click(await screen.findByRole("button", { name: "생일 10월 13일" }));

    expect(screen.getByText("10월")).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { selected: true })).toHaveTextContent("13");
  });

  it("이름·생일이 비어 있으면 '다음으로' 버튼이 비활성화된다", () => {
    setSignupFlow({ step: "profile" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());

    renderContainer();

    expect(screen.getByRole("button", { name: "다음으로" })).toBeDisabled();
  });

  it("이름과 생일을 모두 입력하면 버튼이 활성화되고, 클릭 시 입력값을 저장한 뒤 계좌 입력 페이지로 이동한다", async () => {
    setSignupFlow({ step: "profile" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByRole("textbox", { name: "이름" }), "테스트이름");
    await user.click(screen.getByRole("button", { name: "생일 선택해주세요" }));
    await pickWheelDate(user, { month: 3, day: 5 });

    const nextButton = screen.getByRole("button", { name: "다음으로" });
    expect(nextButton).not.toBeDisabled();
    await user.click(nextButton);

    expect(pushMock).toHaveBeenCalledWith("/auth/payout-account");
    expect(sessionStorage.getItem("signupFlow")).toContain('"nickname":"테스트이름"');
    expect(sessionStorage.getItem("signupFlow")).toContain('"birthday":"03-05"');
  });

  it("뒤로가기 클릭 시 로그아웃에 성공하면 accessToken을 지우고 '/'로 이동한다", async () => {
    setSignupFlow({ step: "profile", nickname: "지유", birthday: "10-13" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    vi.mocked(authService.postLogout).mockResolvedValue(null);
    useAuthStore.getState().setAccessToken("access-token");
    const user = userEvent.setup();

    renderContainer();

    await user.click(screen.getByRole("button", { name: "뒤로 가기" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("지원하지 않는 파일 형식을 선택하면 업로드를 호출하지 않고 안내 토스트를 보여준다", async () => {
    setSignupFlow({ step: "profile" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    const file = new File(["dummy"], "photo.gif", { type: "image/gif" });

    const { container } = renderContainer();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(await screen.findByText("jpg, png, webp 파일만 올릴 수 있어요")).toBeInTheDocument();
    expect(uploadProfileImageMock).not.toHaveBeenCalled();
  });

  it("5MB를 초과하는 파일을 선택하면 업로드를 호출하지 않고 안내 토스트를 보여준다", async () => {
    setSignupFlow({ step: "profile" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });

    const { container } = renderContainer();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(await screen.findByText("5MB 이하의 파일만 올릴 수 있어요")).toBeInTheDocument();
    expect(uploadProfileImageMock).not.toHaveBeenCalled();
  });

  it("유효한 파일을 선택하면 업로드가 호출되고, 성공 시 반환된 이미지 URL이 다음 단계로 저장된다", async () => {
    setSignupFlow({ step: "profile", nickname: "지유", birthday: "10-13" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    uploadProfileImageMock.mockImplementation(
      (_file: File, options: { onSuccess: (imageUrl: string) => void }) =>
        options.onSuccess("https://example.com/uploaded.png"),
    );
    const user = userEvent.setup();

    const { container } = renderContainer();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(uploadProfileImageMock).toHaveBeenCalledWith(file, expect.anything());
    await user.click(screen.getByRole("button", { name: "다음으로" }));

    expect(sessionStorage.getItem("signupFlow")).toContain(
      '"profileImageUrl":"https://example.com/uploaded.png"',
    );
  });

  it("프로필 조회가 업로드 성공보다 늦게 끝나도 업로드한 이미지 URL이 유지된다", async () => {
    setSignupFlow({ step: "profile", nickname: "지유", birthday: "10-13" });
    let resolveProfile: (profile: MyProfile) => void = () => {};
    vi.mocked(userService.getMyProfile).mockReturnValue(
      new Promise(resolve => {
        resolveProfile = resolve;
      }),
    );
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    uploadProfileImageMock.mockImplementation(
      (_file: File, options: { onSuccess: (imageUrl: string) => void }) =>
        options.onSuccess("https://example.com/uploaded.png"),
    );
    const user = userEvent.setup();

    const { container } = renderContainer();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(uploadProfileImageMock).toHaveBeenCalledWith(file, expect.anything());

    resolveProfile(mockProfile);
    await waitFor(() => expect(screen.getByDisplayValue("지유")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "다음으로" }));

    expect(sessionStorage.getItem("signupFlow")).toContain(
      '"profileImageUrl":"https://example.com/uploaded.png"',
    );
  });

  it("이미지 업로드가 실패하면 실패 안내 Dialog를 띄우고 다음 단계로는 저장하지 않는다", async () => {
    setSignupFlow({ step: "profile", nickname: "지유", birthday: "10-13" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    uploadProfileImageMock.mockImplementation((_file: File, options: { onError: () => void }) =>
      options.onError(),
    );
    const user = userEvent.setup();

    const { container } = renderContainer();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    expect(useErrorDialogStore.getState().message).toBe(
      "이미지 업로드에 실패했어요. 다시 시도해주세요",
    );
    useErrorDialogStore.getState().closeErrorDialog();

    await user.click(screen.getByRole("button", { name: "다음으로" }));

    expect(sessionStorage.getItem("signupFlow")).not.toContain("profileImageUrl");
  });

  it("이미지 업로드가 진행 중이면 '다음으로' 버튼이 비활성화된다", () => {
    setSignupFlow({ step: "profile", nickname: "지유", birthday: "10-13" });
    vi.mocked(userService.getMyProfile).mockReturnValue(pendingProfilePromise());
    uploadMutationState.isPending = true;

    renderContainer();

    expect(screen.getByRole("button", { name: "다음으로" })).toBeDisabled();
  });
});
