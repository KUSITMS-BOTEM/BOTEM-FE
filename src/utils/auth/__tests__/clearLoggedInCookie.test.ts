import { clearLoggedInCookie } from "../clearLoggedInCookie";

describe("clearLoggedInCookie", () => {
  let written: string[];

  beforeEach(() => {
    written = [];
    vi.spyOn(document, "cookie", "set").mockImplementation(value => {
      written.push(value);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("host-only와 상위 도메인 후보를 모두 Max-Age=0으로 삭제한다", () => {
    clearLoggedInCookie("app.botem.site", true);

    expect(written).toEqual([
      "isLoggedIn=; Max-Age=0; Path=/; Secure",
      "isLoggedIn=; Max-Age=0; Path=/; Domain=app.botem.site; Secure",
      "isLoggedIn=; Max-Age=0; Path=/; Domain=botem.site; Secure",
    ]);
  });

  it("호스트가 단일 레이블(localhost)이면 host-only만 삭제하고 http에서는 Secure를 붙이지 않는다", () => {
    clearLoggedInCookie("localhost", false);

    expect(written).toEqual(["isLoggedIn=; Max-Age=0; Path=/"]);
  });
});
