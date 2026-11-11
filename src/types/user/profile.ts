export type MyProfile = {
  nickname: string;
  profileImageUrl: string | null;
  // 형식: "MM-DD" (연도 없음)
  birthday: string | null;
  wishProfileUrl: string;
  kakaoConnected: boolean;
  email: string | null;
  // 형식: "yyyy-MM-dd" (한국 날짜 기준)
  joinedAt: string;
};
