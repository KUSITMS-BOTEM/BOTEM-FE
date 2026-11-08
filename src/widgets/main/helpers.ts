import { isValidUrl } from "@/utils/isValidUrl";

type WishStageTitleParams = {
  isLinkValid: boolean;
  showNameField: boolean;
  showPriceField: boolean;
  isPriceEntered: boolean;
};

type WishStageFlagsParams = {
  debouncedUrl: string;
  productImageUrl: File | null;
  debouncedName: string;
  price: string;
};

export const resolveWishStageFlags = ({
  debouncedUrl,
  productImageUrl,
  debouncedName,
  price,
}: WishStageFlagsParams) => {
  const isLinkValid = debouncedUrl.trim().length > 0 && isValidUrl(debouncedUrl);
  const showNameField = isLinkValid && productImageUrl !== null;
  const showPriceField = showNameField && debouncedName.trim().length > 0;
  const isPriceEntered = price.length > 0;

  return { isLinkValid, showNameField, showPriceField, isPriceEntered };
};

export const resolveWishStageTitle = ({
  isLinkValid,
  showNameField,
  showPriceField,
  isPriceEntered,
}: WishStageTitleParams) => {
  if (isPriceEntered) return "이대로 위시를\n추가할까요?";
  if (showPriceField) return "상품의 가격이\n얼마인가요?";
  if (showNameField) return "상품명이\n무엇인가요?";
  if (isLinkValid) return "상품 사진을\n추가해주세요";
  return "갖고 싶은 상품 링크를\n넣어주세요";
};
