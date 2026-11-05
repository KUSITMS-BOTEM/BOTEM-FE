type ParsedCookie = {
  value: string;
  maxAge?: number;
};

// 백엔드 Set-Cookie를 로컬(BFF)에 다시 심을 때 필요한 값·Max-Age만 추출한다.
// ponytail: Max-Age가 없고 Expires만 오는 케이스는 처리하지 않음 — 세션 쿠키로 fallback, 필요해지면 Expires 파싱 추가.
export function parseSetCookieValue(setCookies: string[], name: string): ParsedCookie | null {
  const raw = setCookies.find(cookie => cookie.startsWith(`${name}=`));
  if (!raw) return null;

  const [pair, ...attributes] = raw.split(";").map(part => part.trim());
  const value = pair.slice(name.length + 1);

  const maxAgeAttribute = attributes.find(attribute =>
    attribute.toLowerCase().startsWith("max-age="),
  );
  const maxAge = maxAgeAttribute ? Number(maxAgeAttribute.split("=")[1]) : undefined;

  return maxAge === undefined ? { value } : { value, maxAge };
}
