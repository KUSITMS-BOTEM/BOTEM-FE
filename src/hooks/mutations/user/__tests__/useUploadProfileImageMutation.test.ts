import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { userService } from "@/apis/user/userService";
import { useUploadProfileImageMutation } from "@/hooks/mutations/user/useUploadProfileImageMutation";

vi.mock("@/apis/user/userService", () => ({
  userService: {
    createProfileImageUploadUrl: vi.fn(),
    uploadProfileImage: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const file = new File(["content"], "profile.png", { type: "image/png" });

const uploadUrlResult = {
  uploadUrl: "https://mock-s3.botem.local/profile-image/mock-upload-token",
  imageUrl: "https://mock-s3.botem.local/profile-image/mock-upload-token",
};

describe("useUploadProfileImageMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("성공 시 업로드 URL 발급 → S3 업로드가 순서대로 호출되고 imageUrl이 반환된다", async () => {
    vi.mocked(userService.createProfileImageUploadUrl).mockResolvedValue(uploadUrlResult);
    vi.mocked(userService.uploadProfileImage).mockResolvedValue(undefined);
    const { result } = renderHook(() => useUploadProfileImageMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(userService.createProfileImageUploadUrl).toHaveBeenCalledWith({
      contentType: file.type,
      contentLength: file.size,
    });
    expect(userService.uploadProfileImage).toHaveBeenCalledWith(uploadUrlResult.uploadUrl, file);
    expect(result.current.data).toBe(uploadUrlResult.imageUrl);
  });

  it("업로드 URL 발급이 null을 반환하면 에러 상태가 되고 S3 업로드는 호출되지 않는다", async () => {
    vi.mocked(userService.createProfileImageUploadUrl).mockResolvedValue(null);
    const { result } = renderHook(() => useUploadProfileImageMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("업로드 URL 발급에 실패했습니다."));
    expect(userService.uploadProfileImage).not.toHaveBeenCalled();
  });

  it("업로드 URL 발급 자체가 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("업로드 URL 발급 네트워크 오류");
    vi.mocked(userService.createProfileImageUploadUrl).mockRejectedValue(error);
    const { result } = renderHook(() => useUploadProfileImageMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(userService.uploadProfileImage).not.toHaveBeenCalled();
  });

  it("S3 업로드가 실패하면 mutation이 error 상태가 된다", async () => {
    const error = new Error("프로필 이미지 업로드에 실패했습니다.");
    vi.mocked(userService.createProfileImageUploadUrl).mockResolvedValue(uploadUrlResult);
    vi.mocked(userService.uploadProfileImage).mockRejectedValue(error);
    const { result } = renderHook(() => useUploadProfileImageMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(file);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
