import { openTossApp } from "@/utils/funding/openTossApp";

const originalLocation = window.location;

const setUserAgent = (userAgent: string) =>
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, "location", {
    value: { href: "" },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(window, "location", { value: originalLocation, configurable: true });
});

describe("openTossApp", () => {
  it("데스크탑이면 이동하지 않고 false를 돌려준다", async () => {
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120");

    await expect(openTossApp()).resolves.toBe(false);
    expect(window.location.href).toBe("");
  });

  it("모바일에서 대기 시간 안에 화면이 숨겨지면 앱이 열린 것으로 보고 true를 돌려준다", async () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);

    const result = openTossApp();
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(1500);

    expect(window.location.href).toBe("supertoss://");
    await expect(result).resolves.toBe(true);
  });

  it("모바일에서 화면이 그대로면 앱이 없는 것으로 보고 false를 돌려준다", async () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14)");

    const result = openTossApp();
    await vi.advanceTimersByTimeAsync(1500);

    await expect(result).resolves.toBe(false);
  });
});
