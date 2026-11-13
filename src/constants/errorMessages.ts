export type ErrorAction = "dialog" | "inline" | "redirect" | "none";

type ErrorMessageEntry = {
  message: string;
  action: ErrorAction;
};

// 백엔드(BOTEM-BE) Swagger 에러코드 + FE 자체 생성 코드(src/apis/client.ts) 전체의 노출 메시지·처리 방식 단일 소스.
// 결정 배경·보류 항목은 docs/decisions/global_error_message_mapping.md 참고.
export const ERROR_MESSAGES: Record<string, ErrorMessageEntry> = {
  // --- 인증 ---
  // AUTH_001(Swagger 미문서화 추정 메시지)·AUTH_002·AUTH_003·REISSUE_FAILED는
  // src/apis/client.ts의 reissue 흐름에서 가로채져 UI에 도달하지 않는다 (문서화 목적으로만 기록)
  AUTH_001: { message: "유효하지 않은 인증 정보입니다.", action: "none" },
  AUTH_002: { message: "유효하지 않은 토큰입니다.", action: "none" },
  AUTH_003: { message: "만료된 토큰입니다.", action: "none" },
  AUTH_004: { message: "카카오 로그인에 실패했어요. 다시 시도해주세요.", action: "dialog" },
  AUTH_005: { message: "로그인 중 문제가 발생했어요.", action: "dialog" },

  // --- 공통 ---
  COMMON_001: { message: "입력값을 다시 확인해주세요.", action: "dialog" }, // Toast 전환 검토 대상

  // --- 홈 ---
  HOME_001: { message: "홈에 표시할 펀딩이 존재합니다.", action: "none" }, // 에러가 아닌 정상 분기 신호, useHomeNoFundingQuery에서 로컬 처리

  // --- 계좌 ---
  PAYOUT_ACCOUNT_004: { message: "계좌번호 형식이 올바르지 않습니다.", action: "inline" },

  // --- 추천 상품 ---
  PRODUCT_001: { message: "추천 상품을 찾을 수 없습니다.", action: "none" }, // resolveRecommendedProductErrorAction에서 notFound로 전용 처리
  PRODUCT_002: { message: "판매가 종료된 상품입니다.", action: "dialog" }, // Toast 전환 검토 대상
  PRODUCT_003: { message: "https://로 시작하는 링크를 붙여넣어 주세요.", action: "inline" },
  PRODUCT_004: { message: "쿠팡 상품 링크만 보낼 수 있어요.", action: "inline" },

  // --- 사용자 ---
  USER_001: { message: "사용자 정보를 불러올 수 없어요.", action: "dialog" },
  USER_002: { message: "진행 중인 펀딩이 끝난 뒤 탈퇴할 수 있어요.", action: "dialog" },
  USER_003: { message: "현재 회원 탈퇴 가능 여부를 확인할 수 없습니다.", action: "dialog" },
  USER_004: { message: "이미 온보딩을 완료한 사용자입니다.", action: "redirect" },

  // --- 위시 ---
  WISH_001: { message: "이미 위시에 담은 상품입니다.", action: "dialog" }, // Toast 전환 검토 대상
  WISH_002: { message: "위시를 찾을 수 없습니다.", action: "none" }, // resolveWishErrorAction에서 notFound로 전용 처리
  WISH_003: { message: "펀딩 중인 위시는 삭제할 수 없습니다.", action: "dialog" },

  // --- FE 자체 생성 코드 ---
  NETWORK_ERROR: { message: "서버와 통신 중 오류가 발생했습니다.", action: "dialog" },
  INVALID_RESPONSE: { message: "서버 응답을 처리할 수 없습니다.", action: "dialog" },
  AUTH_EXPIRED: { message: "인증이 만료되었습니다. 다시 로그인해주세요.", action: "dialog" },
  REISSUE_FAILED: { message: "토큰 재발급에 실패했습니다.", action: "none" }, // reissueOrThrow가 즉시 AUTH_EXPIRED로 치환, UI 미도달
  UNKNOWN_ERROR: { message: "알 수 없는 오류가 발생했어요.", action: "dialog" },
};

// 백엔드가 코드를 아직 부여하지 않은 도메인(예: Admin Recommended Product)이거나 ERROR_MESSAGES에 없는 코드일 때 사용
export const DEFAULT_ERROR_MESSAGE: ErrorMessageEntry = {
  message: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
  action: "dialog",
};
