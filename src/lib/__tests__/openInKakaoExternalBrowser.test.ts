import { openInKakaoExternalBrowser } from "@/lib/openInKakaoExternalBrowser";

describe("openInKakaoExternalBrowser", () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("현재 주소를 인코딩해 openExternal 스킴으로 이동한다", () => {
    const location = { href: "" };
    Object.defineProperty(window, "location", { configurable: true, value: location });

    openInKakaoExternalBrowser("https://botem.me/share/abc?a=1&b=2");

    expect(location.href).toBe(
      "kakaotalk://web/openExternal?url=https%3A%2F%2Fbotem.me%2Fshare%2Fabc%3Fa%3D1%26b%3D2",
    );
  });
});
