import { isValidUrl } from "@/utils/isValidUrl";

type WishStageFlagsParams = {
  debouncedUrl: string;
  productImageUrl: File | null;
  debouncedName: string;
  productName: string;
  price: string;
};

export const resolveWishStageFlags = ({
  debouncedUrl,
  productImageUrl,
  debouncedName,
  productName,
  price,
}: WishStageFlagsParams) => {
  const isLinkValid = debouncedUrl.trim().length > 0 && isValidUrl(debouncedUrl);
  const showNameField = isLinkValid && productImageUrl !== null;
  const showPriceField = showNameField && debouncedName.trim().length > 0;
  const isPriceEntered = productName.trim().length > 0 && price.length > 0;

  return { isLinkValid, showNameField, showPriceField, isPriceEntered };
};
