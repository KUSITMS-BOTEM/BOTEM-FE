import { beforeEach, describe, expect, it } from "vitest";

import { useWishDeletedToastStore } from "../wishDeletedToastStore";

describe("useWishDeletedToastStore", () => {
  beforeEach(() => {
    useWishDeletedToastStore.setState({ pending: false });
  });

  it("삭제 이력이 없으면 consume은 false다", () => {
    expect(useWishDeletedToastStore.getState().consume()).toBe(false);
  });

  it("markDeleted 뒤 consume은 true다", () => {
    useWishDeletedToastStore.getState().markDeleted();

    expect(useWishDeletedToastStore.getState().consume()).toBe(true);
  });

  it("consume은 한 번만 true라 이후 재진입에선 토스트가 뜨지 않는다", () => {
    useWishDeletedToastStore.getState().markDeleted();
    useWishDeletedToastStore.getState().consume();

    expect(useWishDeletedToastStore.getState().consume()).toBe(false);
  });
});
