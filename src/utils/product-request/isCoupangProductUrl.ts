const COUPANG_HOSTS = [
  "coupang.com",
  "www.coupang.com",
  "m.coupang.com",
  "link.coupang.com",
  "coupa.ng",
];

// 호스트 완전 일치로 비교해 `evilcoupang.com`·`coupang.com.evil.com` 같은 우회를 막는다
export const isCoupangProductUrl = (value: string) => {
  try {
    const { protocol, hostname } = new URL(value.trim());
    return protocol === "https:" && COUPANG_HOSTS.includes(hostname);
  } catch {
    return false;
  }
};
