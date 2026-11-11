import { expect, test } from "@playwright/test";

import { EXISTING_USER_KAKAO_CODE } from "@/apis/auth/authService.msw";

import { mockKakaoConsentRedirect } from "./helpers";

test.describe("카카오 로그인 온보딩", () => {
  test("신규 유저는 카카오 로그인 후 온보딩을 마치면 메인에서 위시 추가 시트가 열린다", async ({
    page,
    baseURL,
  }) => {
    await mockKakaoConsentRedirect(page, baseURL!, "new-user-code");

    await page.goto("/");
    await page.getByRole("button", { name: "카카오로 이용하기" }).click();

    await expect(page).toHaveURL("/auth/profile-check");
    await page.getByRole("button", { name: "다음으로" }).click();

    await expect(page).toHaveURL("/auth/payout-account");
    await page.getByLabel("계좌번호").fill("11012345678");
    await page.getByRole("button", { name: /은행/ }).click();
    await page.getByRole("button", { name: "토스뱅크" }).click();
    await page.getByRole("button", { name: "시작하기" }).click();

    await expect(page).toHaveURL("/main");
    // <dialog>의 dim·sheet 레이어가 전부 position:fixed라 <dialog> 자신의 bounding box는 0×0으로 잡혀
    // getByRole("dialog")는 항상 hidden 판정이 난다 — 시트 안의 실제 텍스트로 노출 여부를 확인한다.
    await expect(page.getByText("위시 추가", { exact: true })).toBeVisible();
  });

  test("기존 유저는 카카오 로그인 후 온보딩 없이 바로 메인으로 이동한다", async ({
    page,
    baseURL,
  }) => {
    await mockKakaoConsentRedirect(page, baseURL!, EXISTING_USER_KAKAO_CODE);

    await page.goto("/");
    await page.getByRole("button", { name: "카카오로 이용하기" }).click();

    await expect(page).toHaveURL("/main");
    await expect(page.getByText("위시 추가", { exact: true })).not.toBeVisible();
  });
});
