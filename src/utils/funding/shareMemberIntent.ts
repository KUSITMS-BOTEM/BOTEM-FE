// 공유 화면에서 로그인한 회원이 어느 버튼에서 출발했는지. 카카오 로그인은 페이지를 벗어나므로 복귀 경로의 쿼리로 넘긴다
export const SHARE_MEMBER_PARAM = "member";

export type ShareMemberIntent = "myBotem" | "contribute";

// 쿼리는 사용자가 바꿀 수 있으므로 허용된 값만 통과시킨다
export const parseShareMemberIntent = (value: unknown): ShareMemberIntent | undefined =>
  value === "myBotem" || value === "contribute" ? value : undefined;

export const getShareReturnPath = (shareKey: string, intent: ShareMemberIntent) =>
  `/share/${encodeURIComponent(shareKey)}?${SHARE_MEMBER_PARAM}=${intent}`;
