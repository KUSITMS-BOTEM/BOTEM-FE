import { getShareReturnPath, parseShareMemberIntent } from "@/utils/funding/shareMemberIntent";

describe("parseShareMemberIntent", () => {
  it.each(["myBotem", "contribute"])("허용된 값 %s는 그대로 돌려준다", value => {
    expect(parseShareMemberIntent(value)).toBe(value);
  });

  it.each([undefined, "", "admin", "MYBOTEM", ["myBotem"]])(
    "허용되지 않은 값 %j는 undefined로 거른다",
    value => {
      expect(parseShareMemberIntent(value)).toBeUndefined();
    },
  );
});

describe("getShareReturnPath", () => {
  it("공유 화면 경로에 member 쿼리를 붙인다", () => {
    expect(getShareReturnPath("7", "myBotem")).toBe("/share/7?member=myBotem");
    expect(getShareReturnPath("7", "contribute")).toBe("/share/7?member=contribute");
  });

  it("펀딩 id의 특수문자는 인코딩해 경로를 벗어나지 못하게 한다", () => {
    expect(getShareReturnPath("a/b?c", "myBotem")).toBe("/share/a%2Fb%3Fc?member=myBotem");
  });
});
