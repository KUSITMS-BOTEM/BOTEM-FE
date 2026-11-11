import { authHandlers } from "@/apis/auth/authService.msw";
import { productRequestHandlers } from "@/apis/productRequest/productRequestService.msw";
import { recommendedProductHandlers } from "@/apis/recommendedProduct/recommendedProductService.msw";
import { userHandlers } from "@/apis/user/userService.msw";
import { wishHandlers } from "@/apis/wish/wishService.msw";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...wishHandlers,
  ...productRequestHandlers,
  ...recommendedProductHandlers,
];
