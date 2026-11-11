type SignupFlowState = {
  step: "profile" | "accountEntry";
  nickname?: string;
  birthday?: string;
  profileImageUrl?: string | null;
};

const SIGNUP_FLOW_KEY = "signupFlow";

export const getSignupFlow = (): SignupFlowState | null => {
  // profile-check의 useState 초기화 함수에서 렌더 중(SSR 포함) 호출돼 서버 환경 가드가 필요하다
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SIGNUP_FLOW_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setSignupFlow = (state: SignupFlowState) => {
  sessionStorage.setItem(SIGNUP_FLOW_KEY, JSON.stringify(state));
};

export const clearSignupFlow = () => {
  sessionStorage.removeItem(SIGNUP_FLOW_KEY);
};
