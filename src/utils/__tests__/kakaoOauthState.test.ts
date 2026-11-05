import { consumeKakaoOauthState, setKakaoOauthState } from "../kakaoOauthState";

beforeEach(() => {
  sessionStorage.clear();
});

describe("setKakaoOauthState / consumeKakaoOauthState", () => {
  it("저장한 state를 그대로 조회한다", () => {
    setKakaoOauthState("abc-123");

    expect(consumeKakaoOauthState()).toBe("abc-123");
  });

  it("조회 후에는 값이 제거되어 다시 조회하면 null을 반환한다", () => {
    setKakaoOauthState("abc-123");

    consumeKakaoOauthState();

    expect(consumeKakaoOauthState()).toBeNull();
  });

  it("저장된 값이 없을 때 null을 반환한다", () => {
    expect(consumeKakaoOauthState()).toBeNull();
  });
});
