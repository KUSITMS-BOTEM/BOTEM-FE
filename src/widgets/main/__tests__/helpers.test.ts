import { resolveWishStageFlags, resolveWishStageTitle } from "@/widgets/main/helpers";

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

describe("resolveWishStageTitle", () => {
  it("isPriceEntered가 true면 가격 입력 확인 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: false,
        showNameField: false,
        showPriceField: false,
        isPriceEntered: true,
      }),
    ).toBe("이대로 위시를\n추가할까요?");
  });

  it("나머지 조건이 모두 true여도 isPriceEntered가 true면 가격 입력 확인 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: true,
        showNameField: true,
        showPriceField: true,
        isPriceEntered: true,
      }),
    ).toBe("이대로 위시를\n추가할까요?");
  });

  it("showPriceField가 true이고 isPriceEntered가 false면 가격 입력 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: false,
        showNameField: false,
        showPriceField: true,
        isPriceEntered: false,
      }),
    ).toBe("상품의 가격이\n얼마인가요?");
  });

  it("showNameField와 isLinkValid가 true여도 showPriceField가 true면 가격 입력 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: true,
        showNameField: true,
        showPriceField: true,
        isPriceEntered: false,
      }),
    ).toBe("상품의 가격이\n얼마인가요?");
  });

  it("showNameField가 true이고 showPriceField가 false면 상품명 입력 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: false,
        showNameField: true,
        showPriceField: false,
        isPriceEntered: false,
      }),
    ).toBe("상품명이\n무엇인가요?");
  });

  it("isLinkValid가 true여도 showNameField가 true면 상품명 입력 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: true,
        showNameField: true,
        showPriceField: false,
        isPriceEntered: false,
      }),
    ).toBe("상품명이\n무엇인가요?");
  });

  it("isLinkValid가 true이고 showNameField가 false면 상품 사진 추가 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: true,
        showNameField: false,
        showPriceField: false,
        isPriceEntered: false,
      }),
    ).toBe("상품 사진을\n추가해주세요");
  });

  it("모든 조건이 false면 링크 입력 안내 타이틀을 반환한다", () => {
    expect(
      resolveWishStageTitle({
        isLinkValid: false,
        showNameField: false,
        showPriceField: false,
        isPriceEntered: false,
      }),
    ).toBe("갖고 싶은 상품 링크를\n넣어주세요");
  });
});
