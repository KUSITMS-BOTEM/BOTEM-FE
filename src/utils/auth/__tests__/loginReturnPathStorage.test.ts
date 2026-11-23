import {
  clearLoginReturnPath,
  consumeLoginReturnPath,
  getLoginReturnPath,
  setLoginReturnPath,
} from "../loginReturnPathStorage";

beforeEach(() => {
  sessionStorage.clear();
});

describe("loginReturnPathStorage", () => {
  it("저장한 내부 경로를 그대로 조회한다", () => {
    setLoginReturnPath("/friends/5");

    expect(consumeLoginReturnPath()).toBe("/friends/5");
  });

  it("조회 후에는 값이 제거되어 다시 조회하면 null을 반환한다", () => {
    setLoginReturnPath("/friends/5");

    consumeLoginReturnPath();

    expect(consumeLoginReturnPath()).toBeNull();
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "friends/5"])(
    "앱 내부 절대 경로가 아닌 %s는 저장하지 않는다",
    path => {
      setLoginReturnPath(path);

      expect(consumeLoginReturnPath()).toBeNull();
    },
  );

  it("저장소가 오염돼 외부 경로가 들어 있어도 반환하지 않는다", () => {
    sessionStorage.setItem("loginReturnPath", "//evil.com");

    expect(consumeLoginReturnPath()).toBeNull();
  });

  it("get은 경로를 지우지 않고 읽는다", () => {
    setLoginReturnPath("/share/abc");

    expect(getLoginReturnPath()).toBe("/share/abc");
    expect(consumeLoginReturnPath()).toBe("/share/abc");
  });

  it("clear하면 저장된 경로가 사라진다", () => {
    setLoginReturnPath("/friends/5");

    clearLoginReturnPath();

    expect(consumeLoginReturnPath()).toBeNull();
  });
});
