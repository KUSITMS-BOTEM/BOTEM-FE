import { beforeEach, describe, expect, it } from "vitest";

import { useWishOriginStore } from "../wishOriginStore";

const origins = () => useWishOriginStore.getState().recommendedProductIdByWishId;

describe("useWishOriginStore", () => {
  beforeEach(() => {
    useWishOriginStore.setState({ recommendedProductIdByWishId: {} });
  });

  it("기록이 없으면 wishId 조회는 undefined다", () => {
    expect(origins()["1"]).toBeUndefined();
  });

  it("setOrigin 뒤 wishId로 추천 상품 id를 조회한다", () => {
    useWishOriginStore.getState().setOrigin("1", 10);

    expect(origins()["1"]).toBe(10);
  });

  it("다른 wishId를 추가해도 기존 기록이 유지된다", () => {
    useWishOriginStore.getState().setOrigin("1", 10);
    useWishOriginStore.getState().setOrigin("2", 20);

    expect(origins()).toEqual({ "1": 10, "2": 20 });
  });

  it("clearOrigin은 해당 wishId만 지운다", () => {
    useWishOriginStore.getState().setOrigin("1", 10);
    useWishOriginStore.getState().setOrigin("2", 20);

    useWishOriginStore.getState().clearOrigin("1");

    expect(origins()).toEqual({ "2": 20 });
  });

  it("같은 wishId를 다시 setOrigin하면 값을 덮어쓴다", () => {
    useWishOriginStore.getState().setOrigin("1", 10);
    useWishOriginStore.getState().setOrigin("1", 30);

    expect(origins()["1"]).toBe(30);
  });
});
