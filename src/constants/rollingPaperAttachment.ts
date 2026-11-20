// 서버 업로드 허용 형식·용량(롤링페이퍼 첨부). 사진은 선택 시점에, 음성은 녹음 길이로 제한되어 업로드 전에 걸러진다
export const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
