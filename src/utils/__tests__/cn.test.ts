import { cn } from "@/utils/cn";

describe("cn", () => {
  it("여러 클래스 문자열을 공백으로 합친다", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("falsy 값(false, undefined, null, 빈 문자열)은 결과에서 무시한다", () => {
    expect(cn("flex", false, undefined, null, "")).toBe("flex");
  });

  it("조건부 객체 문법에서 true인 키만 포함한다", () => {
    expect(cn({ flex: true, hidden: false })).toBe("flex");
  });

  it("배열 형태 입력도 지원한다", () => {
    expect(cn(["flex", "items-center"])).toBe("flex items-center");
  });

  it("인자가 없으면 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });

  it("충돌하는 tailwind 클래스는 나중 값으로 병합한다", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
