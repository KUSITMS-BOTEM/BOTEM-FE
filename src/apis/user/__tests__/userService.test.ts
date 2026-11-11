// jsdom의 File/Blob이 msw의 Node fetch 인터셉터(Request 프록시)와 충돌해 "_buffer" 접근에서 크래시한다 — 이 파일은 DOM이 필요 없어 node 환경으로 전환해 회피
// @vitest-environment node
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { clientApi } from "@/apis/client";
import { userService } from "@/apis/user/userService";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";
import type { MyProfile } from "@/types/user/profile";
import type { ProfileImageUploadUrlResponse } from "@/types/user/profileImageUpload";

vi.mock("@/apis/client", () => ({
  clientApi: {
    get: vi.fn(),
    post: vi.fn(),
    deleteAuth: vi.fn(),
  },
}));

const mockProfile: MyProfile = {
  nickname: "보탬이",
  profileImageUrl: "https://example.com/profile.png",
  birthday: "01-01",
  wishProfileUrl: "https://example.com/wish",
  kakaoConnected: true,
  email: "test@kakao.com",
  joinedAt: "2026-01-01",
};

describe("userService.getMyProfile", () => {
  it("clientApi.get을 /api/users/me/profile 경로로 호출한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await userService.getMyProfile();

    expect(clientApi.get).toHaveBeenCalledWith("/api/users/me/profile");
  });

  it("clientApi.get이 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.get).mockResolvedValue(mockProfile);

    await expect(userService.getMyProfile()).resolves.toEqual(mockProfile);
  });

  it("clientApi.get이 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("프로필 조회 실패");
    vi.mocked(clientApi.get).mockRejectedValue(error);

    await expect(userService.getMyProfile()).rejects.toBe(error);
  });
});

describe("userService.completeOnboarding", () => {
  const body: RegisterOnboardingRequest = {
    name: "보탬이",
    birthday: "01-01",
    bank: "KB_KOOKMIN",
    accountNumber: "1234567890",
  };

  it("clientApi.post를 온보딩 경로와 body로 호출한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(null);

    await userService.completeOnboarding(body);

    expect(clientApi.post).toHaveBeenCalledWith("/api/users/me/onboarding", body);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("온보딩 완료 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(userService.completeOnboarding(body)).rejects.toBe(error);
  });
});

describe("userService.createProfileImageUploadUrl", () => {
  const body = { contentType: "image/jpeg", contentLength: 1024 };
  const response: ProfileImageUploadUrlResponse = {
    uploadUrl: "https://bucket.s3.example.com/profile/1.jpg?signature=abc",
    imageUrl: "https://bucket.s3.example.com/profile/1.jpg",
  };

  it("clientApi.post를 업로드 URL 발급 경로와 body로 호출한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(response);

    await userService.createProfileImageUploadUrl(body);

    expect(clientApi.post).toHaveBeenCalledWith("/api/users/me/profile-image/upload-url", body);
  });

  it("clientApi.post가 반환한 값을 그대로 반환한다", async () => {
    vi.mocked(clientApi.post).mockResolvedValue(response);

    await expect(userService.createProfileImageUploadUrl(body)).resolves.toEqual(response);
  });

  it("clientApi.post가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("업로드 URL 발급 실패");
    vi.mocked(clientApi.post).mockRejectedValue(error);

    await expect(userService.createProfileImageUploadUrl(body)).rejects.toBe(error);
  });
});

describe("userService.uploadProfileImage", () => {
  const uploadUrl = "https://bucket.s3.example.com/profile/1.jpg";
  const file = new File(["image-bytes"], "profile.jpg", { type: "image/jpeg" });

  const server = setupServer(http.put(uploadUrl, () => new HttpResponse(null, { status: 200 })));

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("uploadUrl로 파일을 PUT 요청하며, Content-Type을 파일 타입과 동일하게 보낸다", async () => {
    let receivedContentType: string | null = null;
    server.use(
      http.put(uploadUrl, ({ request }) => {
        receivedContentType = request.headers.get("content-type");
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await userService.uploadProfileImage(uploadUrl, file);

    expect(receivedContentType).toBe("image/jpeg");
  });

  it("S3가 실패 응답을 반환하면 에러를 던진다", async () => {
    server.use(http.put(uploadUrl, () => new HttpResponse(null, { status: 403 })));

    await expect(userService.uploadProfileImage(uploadUrl, file)).rejects.toThrow(
      "프로필 이미지 업로드에 실패했습니다.",
    );
  });
});

describe("userService.withdraw", () => {
  it("clientApi.deleteAuth를 /api/users/me 경로로 호출한다", async () => {
    vi.mocked(clientApi.deleteAuth).mockResolvedValue(null);

    await userService.withdraw();

    expect(clientApi.deleteAuth).toHaveBeenCalledWith("/api/users/me");
  });

  it("clientApi.deleteAuth가 실패하면 에러를 그대로 전파한다", async () => {
    const error = new Error("회원탈퇴 실패");
    vi.mocked(clientApi.deleteAuth).mockRejectedValue(error);

    await expect(userService.withdraw()).rejects.toBe(error);
  });
});
