import { useMutation } from "@tanstack/react-query";

import { productRequestService } from "@/apis/productRequest/productRequestService";

export const useRequestProductMutation = () =>
  useMutation({ mutationFn: productRequestService.requestProduct });
