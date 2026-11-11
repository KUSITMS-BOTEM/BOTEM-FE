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

  it("모든 필드를 포함해 요청하면 응답 data가 요청 바디와 동일하다", async () => {
    const requestBody: RegisterOnboardingRequest = {
      name: "보탬이",
      birthday: "01-01",
      bank: "KB_KOOKMIN",
      accountNumber: "1234567890",
      profileImageUrl: "https://example.com/profile.png",
    };

    const response = await postOnboarding(requestBody);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.data).toEqual(requestBody);
    expect(body.error).toBeNull();
  });

  it("선택 필드(birthday, profileImageUrl)를 생략해도 응답 data가 보낸 값 그대로 echo된다", async () => {
    const requestBody: RegisterOnboardingRequest = {
      name: "보탬이",
      bank: "KB_KOOKMIN",
      accountNumber: "1234567890",
    };

    const response = await postOnboarding(requestBody);
    const body = await response.json();

    expect(body.data).toEqual(requestBody);
    expect(body.data).not.toHaveProperty("birthday");
    expect(body.data).not.toHaveProperty("profileImageUrl");
  });
});
