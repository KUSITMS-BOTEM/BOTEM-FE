import { isGoogleAppBrowser } from "@/utils/isGoogleAppBrowser";

describe("isGoogleAppBrowser", () => {
  it("구글 앱 UA(GSA/)면 true", () => {
    expect(
      isGoogleAppBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 GSA/360.0.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
  });

  it("일반 Safari·카카오톡 UA면 false", () => {
    expect(isGoogleAppBrowser("Mozilla/5.0 (iPhone) Safari/604.1")).toBe(false);
    expect(isGoogleAppBrowser("Mozilla/5.0 (iPhone) KAKAOTALK 10.0.0")).toBe(false);
  });
});
