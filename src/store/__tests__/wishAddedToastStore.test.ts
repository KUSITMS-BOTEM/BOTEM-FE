import { beforeEach, describe, expect, it } from "vitest";

import { useWishAddedToastStore } from "../wishAddedToastStore";

describe("useWishAddedToastStore", () => {
  beforeEach(() => {
    useWishAddedToastStore.setState({ pending: false });
  });

  it("담기 이력이 없으면 consume은 false다", () => {
    expect(useWishAddedToastStore.getState().consume()).toBe(false);
  });

  it("markAdded 뒤 consume은 true다", () => {
    useWishAddedToastStore.getState().markAdded();

    expect(useWishAddedToastStore.getState().consume()).toBe(true);
  });

  it("consume은 한 번만 true라 이후 재진입에선 토스트가 뜨지 않는다", () => {
    useWishAddedToastStore.getState().markAdded();
    useWishAddedToastStore.getState().consume();

    expect(useWishAddedToastStore.getState().consume()).toBe(false);
  });
});
