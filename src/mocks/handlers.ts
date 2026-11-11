import { authHandlers } from "@/apis/auth/authService.msw";
import { contributionHandlers } from "@/apis/contribution/contributionService.msw";
import { homeHandlers } from "@/apis/home/homeService.msw";
import { productRequestHandlers } from "@/apis/product-request/productRequestService.msw";
import { recommendedProductHandlers } from "@/apis/recommended-product/recommendedProductService.msw";
import { userHandlers } from "@/apis/user/userService.msw";
import { wishHandlers } from "@/apis/wish/wishService.msw";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...homeHandlers,
  ...contributionHandlers,
  ...wishHandlers,
  ...productRequestHandlers,
  ...recommendedProductHandlers,
];
