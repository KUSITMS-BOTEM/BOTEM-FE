import { clientApi } from "@/apis/client";
import type { AddWishRequest, WishPageResponse, WishResponse } from "@/types/wish/wish";

export const wishService = {
  getWishes: () => clientApi.get<WishPageResponse>("/api/wishes"),
  getWish: (wishId: string) => clientApi.get<WishResponse>(`/api/wishes/${wishId}`),
  deleteWish: (wishId: string) => clientApi.delete<null>(`/api/wishes/${wishId}`),
  addWish: (body: AddWishRequest) => clientApi.post<WishResponse>("/api/wishes", body),
};
