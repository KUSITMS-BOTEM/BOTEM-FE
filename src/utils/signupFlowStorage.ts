type SignupFlowState = { step: "profile" | "firstWish"; nickname?: string; birthday?: string };

const SIGNUP_FLOW_KEY = "signupFlow";

export const getSignupFlow = (): SignupFlowState | null => {
  const raw = sessionStorage.getItem(SIGNUP_FLOW_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setSignupFlow = (state: SignupFlowState) => {
  sessionStorage.setItem(SIGNUP_FLOW_KEY, JSON.stringify(state));
};

export const clearSignupFlow = () => {
  sessionStorage.removeItem(SIGNUP_FLOW_KEY);
};
