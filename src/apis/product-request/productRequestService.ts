import { clientApi } from "@/apis/client";
import type { RequestProductRequest } from "@/types/product-request/productRequest";

export const productRequestService = {
  requestProduct: (body: RequestProductRequest) =>
    clientApi.post<null>("/api/product-requests", body),
};
