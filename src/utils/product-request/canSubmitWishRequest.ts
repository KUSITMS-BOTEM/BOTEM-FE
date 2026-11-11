type WishRequestInput = {
  productUrl: string;
};

// 링크 형식 검증은 제출 시점에 Toast로 안내하므로, 버튼 활성화는 링크 입력 여부만 본다 (상품 이름은 선택)
export const canSubmitWishRequest = ({ productUrl }: WishRequestInput) =>
  productUrl.trim().length > 0;
