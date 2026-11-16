export type MyProfile = {
  // 카카오 닉네임 — 수정 불가
  nickname: string;
  // 사용자가 온보딩·프로필 수정에서 입력한 이름. 온보딩 전이면 null
  name: string | null;
  profileImageUrl: string | null;
  // 형식: "MM-DD" (연도 없음)
  birthday: string | null;
  wishProfileUrl: string;
  kakaoConnected: boolean;
  email: string | null;
  // 형식: "yyyy-MM-dd" (한국 날짜 기준)
  joinedAt: string;
};

// 이름·생일은 매번 전체 값을 보낸다(부분 수정 불가)
export type UpdateMyProfileRequest = {
  name: string;
  // 형식: "MM-DD" (연도 없음)
  birthday: string;
  // 생략하면 기존 이미지를 유지한다. /profile-image/upload-url이 응답한 imageUrl만 전달 가능
  profileImageUrl?: string;
};
