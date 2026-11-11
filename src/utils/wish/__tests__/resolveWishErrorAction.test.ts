import { resolveWishErrorAction } from "@/utils/wish/resolveWishErrorAction";
import { ApiError } from "@/types/api";

describe("resolveWishErrorAction", () => {
  it("ApiError가 아니면 none을 반환한다", () => {
    expect(resolveWishErrorAction(new Error("network"))).toBe("none");
    expect(resolveWishErrorAction(null)).toBe("none");
  });

  it("WISH_002면 notFound를 반환한다", () => {
    expect(resolveWishErrorAction(new ApiError("WISH_002", "위시 없음"))).toBe("notFound");
  });

  it("AUTH_로 시작하는 코드면 unauthorized를 반환한다", () => {
    expect(resolveWishErrorAction(new ApiError("AUTH_001", "인증 실패"))).toBe("unauthorized");
  });

  it("그 외 코드면 alert를 반환한다", () => {
    expect(resolveWishErrorAction(new ApiError("WISH_001", "서버 오류"))).toBe("alert");
  });
});
