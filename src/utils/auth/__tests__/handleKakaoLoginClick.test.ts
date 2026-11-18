import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { consumeKakaoOauthState } from "@/utils/auth/kakaoOauthState";
import { consumeLoginReturnPath, setLoginReturnPath } from "@/utils/auth/loginReturnPathStorage";
import { getSignupFlow, setSignupFlow } from "@/utils/auth/signupFlowStorage";

const ORIGIN = "http://localhost:3000";

const respondWith = (data: { loginUri: string } | null) =>
  vi.fn((_redirectUri: string, options: { onSuccess: (value: unknown) => void }) =>
    options.onSuccess(data),
  );

describe("handleKakaoLoginClick", () => {
  let location: { origin: string; href: string };

  beforeEach(() => {
    sessionStorage.clear();
    location = { origin: ORIGIN, href: `${ORIGIN}/share/profile/5` };
    vi.stubGlobal("location", location);
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "0000-state" as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("돌아올 경로를 넘기면 sessionStorage에 저장한다", () => {
    handleKakaoLoginClick(vi.fn(), "/friends/5");

    expect(consumeLoginReturnPath()).toBe("/friends/5");
  });

  it("경로 없이 호출하면 예전에 저장된 경로를 지운다", () => {
    setLoginReturnPath("/friends/5");

    handleKakaoLoginClick(vi.fn());

    expect(consumeLoginReturnPath()).toBeNull();
  });

  it("남아 있던 가입 진행 상태를 지운다", () => {
    setSignupFlow({ step: "profile" });

    handleKakaoLoginClick(vi.fn());

    expect(getSignupFlow()).toBeNull();
  });

  it("콜백 주소로 로그인 URI를 요청한다", () => {
    const mutate = vi.fn();

    handleKakaoLoginClick(mutate);

    expect(mutate).toHaveBeenCalledWith(`${ORIGIN}/auth/callback`, expect.anything());
  });

  it("카카오 로그인 URI를 받으면 state를 붙이고 저장한 뒤 그 주소로 이동한다", () => {
    const mutate = respondWith({ loginUri: "https://kauth.kakao.com/oauth/authorize?client_id=a" });

    handleKakaoLoginClick(mutate as never);

    const target = new URL(location.href);
    expect(target.host).toBe("kauth.kakao.com");
    expect(target.searchParams.get("state")).toBe("0000-state");
    expect(consumeKakaoOauthState()).toBe("0000-state");
  });

  it("카카오가 아닌 host의 URI는 이동하지 않고 state도 저장하지 않는다", () => {
    const mutate = respondWith({ loginUri: "https://evil.com/oauth/authorize" });

    handleKakaoLoginClick(mutate as never);

    expect(location.href).toBe(`${ORIGIN}/share/profile/5`);
    expect(consumeKakaoOauthState()).toBeNull();
  });

  it("응답 데이터가 없으면 아무것도 하지 않는다", () => {
    handleKakaoLoginClick(respondWith(null) as never);

    expect(location.href).toBe(`${ORIGIN}/share/profile/5`);
    expect(consumeKakaoOauthState()).toBeNull();
  });
});
