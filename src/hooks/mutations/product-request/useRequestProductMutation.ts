import { useMutation } from "@tanstack/react-query";

import { productRequestService } from "@/apis/product-request/productRequestService";

export const useRequestProductMutation = () =>
  useMutation({ mutationFn: productRequestService.requestProduct });
