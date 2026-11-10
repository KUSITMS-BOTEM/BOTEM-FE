import { isValidUrl } from "@/utils/isValidUrl";

type WishRequestInput = {
  productUrl: string;
  productName: string;
};

export const canSubmitWishRequest = ({ productUrl, productName }: WishRequestInput) =>
  isValidUrl(productUrl) && productName.trim().length > 0;
