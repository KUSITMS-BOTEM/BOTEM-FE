import { ApiError } from "@/types/api";

export type WishErrorAction = "notFound" | "unauthorized" | "alert" | "none";

// WISH_002: 위시 없음(다른 회원의 위시 포함), AUTH_*: 인증 실패(reissue 실패 포함)
export const resolveWishErrorAction = (error: unknown): WishErrorAction => {
  if (!(error instanceof ApiError)) return "none";
  if (error.code === "WISH_002") return "notFound";
  if (error.code.startsWith("AUTH_")) return "unauthorized";
  return "alert";
};
