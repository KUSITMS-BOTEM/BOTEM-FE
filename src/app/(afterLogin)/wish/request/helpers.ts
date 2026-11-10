type WishRequestInput = {
  productUrl: string;
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

// 링크 형식 검증은 제출 시점에 Toast로 안내하므로, 버튼 활성화는 링크 입력 여부만 본다 (상품 이름은 선택)
export const canSubmitWishRequest = ({ productUrl }: WishRequestInput) =>
  productUrl.trim().length > 0;
