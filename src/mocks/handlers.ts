import { authHandlers } from "@/apis/auth/authService.msw";
import { productRequestHandlers } from "@/apis/product-request/productRequestService.msw";
import { recommendedProductHandlers } from "@/apis/recommended-product/recommendedProductService.msw";
import { userHandlers } from "@/apis/user/userService.msw";
import { wishHandlers } from "@/apis/wish/wishService.msw";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...wishHandlers,
  ...productRequestHandlers,
  ...recommendedProductHandlers,
];
