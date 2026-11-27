import { isKakaoDefaultImage } from "@/utils/isKakaoDefaultImage";

describe("isKakaoDefaultImage", () => {
  it.each([
    "https://img1.kakaocdn.net/thumb/R640x640.q70/?fname=https%3A%2F%2Ft1.kakaocdn.net%2Faccount_images%2Fdefault_profile.jpeg",
    "https://t1.kakaocdn.net/account_images/default_profile.jpeg",
  ])("카카오 기본 프로필 URL이면 true", url => {
    expect(isKakaoDefaultImage(url)).toBe(true);
  });

  it.each([
    "https://img1.kakaocdn.net/thumb/R640x640.q70/?fname=https%3A%2F%2Fk.kakaocdn.net%2Fdn%2Fabc%2Fimg_640x640.jpg",
    "https://example.com/default_profile.png",
  ])("직접 설정한 사진이나 카카오가 아닌 URL이면 false", url => {
    expect(isKakaoDefaultImage(url)).toBe(false);
  });
});
