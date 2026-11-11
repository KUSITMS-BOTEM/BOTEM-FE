import { resolveWishStageFlags } from "../resolveWishStageFlags";

describe("resolveWishStageFlags", () => {
  const baseParams = {
    debouncedUrl: "https://www.coupang.com/vp/products/123",
    productImageUrl: new File(["dummy"], "photo.png", { type: "image/png" }),
    debouncedName: "치이카와 인형",
    productName: "치이카와 인형",
    price: "30000",
  };

  it("상품명과 가격이 모두 입력되어 있으면 isPriceEntered가 true다", () => {
    expect(resolveWishStageFlags(baseParams).isPriceEntered).toBe(true);
  });

  it("가격을 입력한 뒤 상품명을 지우면 isPriceEntered가 false로 돌아간다", () => {
    expect(resolveWishStageFlags({ ...baseParams, productName: "" }).isPriceEntered).toBe(false);
  });

  it("상품명이 공백뿐이어도 isPriceEntered가 false다", () => {
    expect(resolveWishStageFlags({ ...baseParams, productName: "   " }).isPriceEntered).toBe(false);
  });
});
