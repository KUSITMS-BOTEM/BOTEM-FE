import { beforeEach, describe, expect, it } from "vitest";

import { useWishToastStore } from "../wishToastStore";

describe("useWishToastStore", () => {
  beforeEach(() => {
    useWishToastStore.setState({ pending: null });
  });

  it("예약이 없으면 consume은 false다", () => {
    expect(useWishToastStore.getState().consume("added")).toBe(false);
  });

  it("mark한 종류로 consume하면 true다", () => {
    useWishToastStore.getState().mark("deleted");

    expect(useWishToastStore.getState().consume("deleted")).toBe(true);
  });

  it("다른 종류로 consume하면 false이고 예약은 유지된다", () => {
    useWishToastStore.getState().mark("deleted");

    expect(useWishToastStore.getState().consume("added")).toBe(false);
    expect(useWishToastStore.getState().pending).toBe("deleted");
  });

  it("consume은 한 번만 true라 이후 재진입에선 토스트가 뜨지 않는다", () => {
    useWishToastStore.getState().mark("added");
    useWishToastStore.getState().consume("added");

    expect(useWishToastStore.getState().consume("added")).toBe(false);
  });
});
