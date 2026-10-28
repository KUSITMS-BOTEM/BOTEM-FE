// 서명 검증 없이 exp 클레임만 디코딩 — 선제적 재발급 트리거 용도일 뿐 인증 검증 목적이 아니다
export function isTokenExpired(token: string): boolean {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return true;

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };

    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
