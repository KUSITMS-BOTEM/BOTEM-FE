// 백엔드는 reissue 실패 시 isLoggedIn을 만료시키지 않아 proxy.ts가 계속 로그인 상태로 본다.
// 이 쿠키는 HttpOnly가 아니고 Domain 설정값을 FE가 알 수 없으므로, host-only와 상위 도메인 후보를 모두 삭제한다.
export function clearLoggedInCookie(
  hostname = window.location.hostname,
  secure = window.location.protocol === "https:",
) {
  const labels = hostname.split(".");
  const parentDomains = labels.length > 1 ? labels.map((_, i) => labels.slice(i).join(".")) : [];
  // 마지막 항목은 TLD 단독(예: site)이라 Domain으로 쓸 수 없다
  const domains = [undefined, ...parentDomains.slice(0, -1)];

  for (const domain of domains) {
    const attrs = ["isLoggedIn=", "Max-Age=0", "Path=/"];
    if (domain) attrs.push(`Domain=${domain}`);
    if (secure) attrs.push("Secure");
    document.cookie = attrs.join("; ");
  }
}
