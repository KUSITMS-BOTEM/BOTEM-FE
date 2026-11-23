import { getMicBlockedInApp } from "@/utils/getMicBlockedInApp";

const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

describe("getMicBlockedInApp", () => {
  it.each([
    ["카카오톡 iOS", `${IOS} Mobile/15E148 KAKAOTALK 10.0.0`, "kakaotalk"],
    [
      "카카오톡 Android",
      "Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile KAKAOTALK/10.0",
      "kakaotalk",
    ],
    ["네이버 앱", `${IOS} NAVER(inapp; search; 1000; 12.0)`, "other"],
    ["라인", `${IOS} Safari/604.1 Line/13.0.0`, "other"],
    ["페이스북", `${IOS} [FBAN/FBIOS;FBAV/450.0]`, "other"],
  ])("%s 인앱은 %s로 판별한다", (_, ua, expected) => {
    expect(getMicBlockedInApp(ua)).toBe(expected);
  });

  it.each([
    ["인스타그램 인앱", `${IOS} Instagram 300.0`],
    ["일반 Safari", `${IOS} Version/17.0 Mobile/15E148 Safari/604.1`],
    ["일반 Chrome", "Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36"],
  ])("%s는 대상이 아니다", (_, ua) => {
    expect(getMicBlockedInApp(ua)).toBeNull();
  });
});
