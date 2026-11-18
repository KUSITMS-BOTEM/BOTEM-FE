import type { FriendWishResponse } from "@/types/friend/friend";
import type { FundingWish } from "@/types/funding/funding";
import { isValidUrl } from "@/utils/isValidUrl";

export const toFundingWish = (wish: FriendWishResponse): FundingWish => ({
  productName: wish.productName,
  productImageUrl:
    wish.productImageUrl && isValidUrl(wish.productImageUrl) ? wish.productImageUrl : undefined,
  price: wish.price,
});
