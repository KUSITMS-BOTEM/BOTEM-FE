import { withSubjectParticle, withVocativeParticle } from "@/utils/withSubjectParticle";

describe("withVocativeParticle", () => {
  it.each(["민준", "서진"])("받침이 있는 이름 %s 뒤에는 '아'를 붙인다", name => {
    expect(withVocativeParticle(name)).toBe(`${name}아`);
  });

  it.each(["지유", "Tom"])("받침이 없거나 영문인 이름 %s 뒤에는 '야'를 붙인다", name => {
    expect(withVocativeParticle(name)).toBe(`${name}야`);
  });
});

describe("withSubjectParticle", () => {
  it.each(["민준", "서진", "혁"])("받침이 있는 이름 %s 뒤에는 '이'를 붙인다", name => {
    expect(withSubjectParticle(name)).toBe(`${name}이`);
  });

  it.each(["지유", "서하", "수"])("받침이 없는 이름 %s 뒤에는 '가'를 붙인다", name => {
    expect(withSubjectParticle(name)).toBe(`${name}가`);
  });

  it.each(["Tom", "Jin7"])("영문·숫자로 끝나는 이름 %s 뒤에는 '가'를 붙인다", name => {
    expect(withSubjectParticle(name)).toBe(`${name}가`);
  });

  it("한글 범위의 처음('가', 받침 없음)과 끝('힣', 받침 있음)을 구분한다", () => {
    expect(withSubjectParticle("가")).toBe("가가");
    expect(withSubjectParticle("힣")).toBe("힣이");
  });

  it("한글 범위 밖 자모로 끝나면 '가'를 붙인다", () => {
    expect(withSubjectParticle("ㄱ")).toBe("ㄱ가");
  });
});
