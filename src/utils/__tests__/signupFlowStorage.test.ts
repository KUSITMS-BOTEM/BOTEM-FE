import { clearSignupFlow, getSignupFlow, setSignupFlow } from "../signupFlowStorage";

beforeEach(() => {
  sessionStorage.clear();
});

describe("getSignupFlow", () => {
  it("저장된 값이 없을 때 null을 반환한다", () => {
    expect(getSignupFlow()).toBeNull();
  });
});

describe("setSignupFlow", () => {
  it("nickname·birthday 없는 기본 state를 저장하면 그대로 조회된다", () => {
    setSignupFlow({ step: "profile" });

    expect(getSignupFlow()).toEqual({ step: "profile" });
  });

  it("nickname과 birthday를 포함한 state를 저장하면 모든 필드가 그대로 보존된다", () => {
    setSignupFlow({ step: "profile", nickname: "보탬이", birthday: "2000-01-01" });

    expect(getSignupFlow()).toEqual({
      step: "profile",
      nickname: "보탬이",
      birthday: "2000-01-01",
    });
  });

  it("step이 firstWish인 state도 정상적으로 저장·조회된다", () => {
    setSignupFlow({ step: "firstWish", nickname: "보탬이" });

    expect(getSignupFlow()).toEqual({ step: "firstWish", nickname: "보탬이" });
  });

  it("여러 번 호출하면 가장 최근 값으로 덮어써진다", () => {
    setSignupFlow({ step: "profile", nickname: "첫번째" });
    setSignupFlow({ step: "firstWish", nickname: "두번째" });

    expect(getSignupFlow()).toEqual({ step: "firstWish", nickname: "두번째" });
  });
});

describe("clearSignupFlow", () => {
  it("호출 후 getSignupFlow는 null을 반환한다", () => {
    setSignupFlow({ step: "profile" });

    clearSignupFlow();

    expect(getSignupFlow()).toBeNull();
  });

  it("저장된 값이 없는 초기 상태에서 호출해도 에러 없이 실행된다", () => {
    expect(() => clearSignupFlow()).not.toThrow();
  });
});
