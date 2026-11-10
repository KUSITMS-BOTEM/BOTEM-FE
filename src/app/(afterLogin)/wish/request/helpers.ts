type WishRequestInput = {
  productUrl: string;
  productName: string;
};

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

// 링크 형식 검증은 제출 시점에 Toast로 안내하므로, 버튼 활성화는 입력 여부만 본다
export const canSubmitWishRequest = ({ productUrl, productName }: WishRequestInput) =>
  productUrl.trim().length > 0 && productName.trim().length > 0;
