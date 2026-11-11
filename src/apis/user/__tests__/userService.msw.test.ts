import { setupServer } from "msw/node";

import type { RegisterOnboardingRequest } from "@/types/user/onboarding";

import { userHandlers } from "../userService.msw";

const ONBOARDING_URL = "http://localhost/api/users/me/onboarding";

const postOnboarding = (body: RegisterOnboardingRequest) =>
  fetch(ONBOARDING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("userHandlers - POST /api/users/me/onboarding", () => {
  const server = setupServer(...userHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("요청이 성공하면 success:true, data:null을 응답한다 (실제 API 계약과 동일)", async () => {
    const requestBody: RegisterOnboardingRequest = {
      name: "보탬이",
      birthday: "01-01",
      bank: "KB_KOOKMIN",
      accountNumber: "1234567890",
      profileImageUrl: "https://example.com/profile.png",
    };

    const response = await postOnboarding(requestBody);
    const body = await response.json();

    expect(body).toEqual({ success: true, data: null, error: null });
  });
});

describe("userHandlers - POST /api/users/me/profile-image/upload-url", () => {
  const server = setupServer(...userHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("uploadUrl과 imageUrl을 포함한 발급 성공 응답을 반환한다", async () => {
    const response = await fetch("http://localhost/api/users/me/profile-image/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "image/png", contentLength: 1024 }),
    });
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data.uploadUrl).toMatch(/^https:\/\/mock-s3\.botem\.local\//);
    expect(body.data.imageUrl).toBe(body.data.uploadUrl);
  });
});

describe("userHandlers - PUT https://mock-s3.botem.local/* (S3 업로드 모킹)", () => {
  const server = setupServer(...userHandlers);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("발급된 uploadUrl로의 PUT 요청에 200을 응답한다", async () => {
    const response = await fetch("https://mock-s3.botem.local/profile-image/mock-upload-token", {
      method: "PUT",
      body: "dummy-image-bytes",
    });

    expect(response.status).toBe(200);
  });
});
