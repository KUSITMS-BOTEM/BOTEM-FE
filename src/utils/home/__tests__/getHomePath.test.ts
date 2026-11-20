import { getHomePath } from "@/utils/home/getHomePath";

describe("getHomePath", () => {
  it("값을 넣으면 기존 쿼리를 유지한 채 추가한다", () => {
    expect(getHomePath(new URLSearchParams("tab=wish"), { menu: "open" })).toBe(
      "/home?tab=wish&menu=open",
    );
  });

  it("null이면 해당 키만 지운다", () => {
    expect(getHomePath(new URLSearchParams("tab=wish&menu=open"), { menu: null })).toBe(
      "/home?tab=wish",
    );
  });

  it("남는 쿼리가 없으면 /home을 돌려준다", () => {
    expect(getHomePath(new URLSearchParams("open=funding"), { open: null })).toBe("/home");
  });

  it("이미 있는 키는 값을 덮어쓴다", () => {
    expect(getHomePath(new URLSearchParams("tab=funding"), { tab: "wish" })).toBe("/home?tab=wish");
  });
});
