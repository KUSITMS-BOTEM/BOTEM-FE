// 카카오 기본 프로필 사용자는 값이 비어 오지 않고 기본 사진 URL(원본 또는 썸네일 프록시)이 내려온다
export const isKakaoDefaultImage = (url: string) =>
  url.includes("kakaocdn.net") && url.includes("default_profile");
