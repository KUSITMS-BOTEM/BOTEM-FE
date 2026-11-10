import { clientApi } from "@/apis/client";
import type { WishResponse } from "@/types/wish/wish";

export const wishService = {
  getWish: (wishId: string) => clientApi.get<WishResponse>(`/api/wishes/${wishId}`),
};
