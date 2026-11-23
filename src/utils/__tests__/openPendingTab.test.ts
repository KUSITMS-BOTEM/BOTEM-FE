import { openPendingTab } from "@/utils/openPendingTab";

const makeTab = () => ({ opener: {}, location: { href: "" }, close: vi.fn() }) as unknown as Window;

afterEach(() => vi.restoreAllMocks());

describe("openPendingTab", () => {
  it("호출하자마자 빈 탭을 연다", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => makeTab());

    openPendingTab();

    expect(open).toHaveBeenCalledWith("", "_blank");
  });

  it("http(s) 링크로 보내면서 원래 창 참조(opener)를 끊는다", () => {
    const tab = makeTab();
    vi.spyOn(window, "open").mockImplementation(() => tab);

    openPendingTab().navigate("https://www.coupang.com/vp/products/1");

    expect(tab.opener).toBeNull();
    expect(tab.location.href).toBe("https://www.coupang.com/vp/products/1");
  });

  it.each([["javascript:alert(1)"], [undefined]])("링크가 %s면 탭을 닫는다", url => {
    const tab = makeTab();
    vi.spyOn(window, "open").mockImplementation(() => tab);

    openPendingTab().navigate(url);

    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.href).toBe("");
  });

  it("close를 부르면 열어 둔 탭을 닫는다", () => {
    const tab = makeTab();
    vi.spyOn(window, "open").mockImplementation(() => tab);

    openPendingTab().close();

    expect(tab.close).toHaveBeenCalled();
  });

  describe("팝업이 막혀 탭이 열리지 않으면", () => {
    const originalLocation = window.location;
    const assign = vi.fn();

    beforeEach(() => {
      vi.spyOn(window, "open").mockImplementation(() => null);
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, assign },
      });
    });
    afterEach(() => {
      Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
      assign.mockReset();
    });

    it("지금 탭에서 링크로 이동한다", () => {
      openPendingTab().navigate("https://www.coupang.com/vp/products/1");

      expect(assign).toHaveBeenCalledWith("https://www.coupang.com/vp/products/1");
    });

    it.each([["javascript:alert(1)"], [undefined]])("링크가 %s면 이동하지 않는다", url => {
      openPendingTab().navigate(url);

      expect(assign).not.toHaveBeenCalled();
    });

    it("close를 불러도 에러가 나지 않는다", () => {
      expect(() => openPendingTab().close()).not.toThrow();
    });
  });
});
