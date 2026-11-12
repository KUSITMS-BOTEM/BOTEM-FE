import { expect, test } from "@playwright/test";

import { EXISTING_USER_KAKAO_CODE } from "@/apis/auth/authService.msw";

import { gotoKakaoCallback } from "./helpers";

test.describe("카카오 로그인 온보딩", () => {
  test("신규 유저는 카카오 로그인 후 온보딩을 마치면 메인으로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "카카오로 이용하기" }).click();

    await expect(page).toHaveURL("/auth/profile-check");
    await page.getByRole("button", { name: "다음으로" }).click();

    await expect(page).toHaveURL("/auth/payout-account");
    await page.getByLabel("계좌번호").fill("11012345678");
    await page.getByRole("button", { name: /은행/ }).click();
    await page.getByRole("button", { name: "토스뱅크" }).click();
    await page.getByRole("button", { name: "시작하기" }).click();

    // 온보딩 직후 위시 추가 시트·추천 위시 페이지로 자동 이동하지 않고 메인에 머문다.
    await expect(page).toHaveURL("/home");
    await expect(page.getByText("위시 추가", { exact: true })).not.toBeVisible();
  });

  test("기존 유저는 카카오 로그인 후 온보딩 없이 바로 메인으로 이동한다", async ({ page }) => {
    await gotoKakaoCallback(page, EXISTING_USER_KAKAO_CODE);

    await expect(page).toHaveURL("/home");
    await expect(page.getByText("위시 추가", { exact: true })).not.toBeVisible();
  });
});
