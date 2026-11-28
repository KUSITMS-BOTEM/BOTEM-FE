import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  // 사용자가 로그아웃·탈퇴로 세션을 직접 끝냈는지. 이후 남은 조회의 401을 인증 만료로 안내하지 않기 위해 둔다
  signedOut: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
  markSignedOut: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  signedOut: false,
  setAccessToken: accessToken => set({ accessToken, signedOut: false }),
  clearAccessToken: () => set({ accessToken: null }),
  markSignedOut: () => set({ accessToken: null, signedOut: true }),
}));
