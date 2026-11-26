// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (AddWishBottomSheet 모션 기준)
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
export const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
export const FIELD_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };
// 이미 화면에 있는 입력 뒤에 나타나는 Title·필드는 delay를 짧게 잡는다
export const FOLLOW_TITLE_TRANSITION = { ...TITLE_TRANSITION, delay: 0 };
export const FOLLOW_FIELD_TRANSITION = { ...FIELD_TRANSITION, delay: 0.15 };
// 위에 새 필드가 생겨 아래 필드가 밀려 내려갈 때는 등장 delay 없이 바로 따라 내려간다
export const PUSH_DOWN_TRANSITION = { duration: 0.4, ease: EASE_STANDARD };
// 하단 고정 CTA(버튼 56 + 아래 패딩 20 + 그라데이션 일부)에 마지막 필드가 가려지지 않게 비운다
export const CTA_CLEARANCE_CLASS = "pb-[calc(6rem+env(safe-area-inset-bottom))]";
