import {
  consumeKakaoOauthState,
  createKakaoOauthState,
  getReturnPathFromKakaoOauthState,
  setKakaoOauthState,
} from "../kakaoOauthState";

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

describe("createKakaoOauthState", () => {
  it("복귀 경로가 있으면 nonce 뒤에 경로를 붙인다", () => {
    expect(createKakaoOauthState("nonce", "/share/profile/abc")).toBe("nonce./share/profile/abc");
  });

  it("복귀 경로가 없으면 nonce만 쓴다", () => {
    expect(createKakaoOauthState("nonce")).toBe("nonce");
  });
});

describe("getReturnPathFromKakaoOauthState", () => {
  it("만든 state에서 공유 화면 경로를 되살린다", () => {
    const state = createKakaoOauthState("0000-state", "/share/profile/abc");

    expect(getReturnPathFromKakaoOauthState(state)).toBe("/share/profile/abc");
  });

  it("공유 화면이 아닌 경로는 되살리지 않는다", () => {
    expect(getReturnPathFromKakaoOauthState("nonce./my/profile")).toBeNull();
  });

  it("경로가 없는 state면 null을 반환한다", () => {
    expect(getReturnPathFromKakaoOauthState("nonce")).toBeNull();
  });
});
