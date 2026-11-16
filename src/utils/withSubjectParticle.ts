const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;

// 한글이 아닌 끝글자(영문·숫자 등)는 받침 판별이 불가능해 '가'로 둔다
export function withSubjectParticle(name: string): string {
  const code = name.charCodeAt(name.length - 1);
  const hasBatchim =
    code >= HANGUL_START && code <= HANGUL_END && (code - HANGUL_START) % JONGSEONG_COUNT !== 0;
  return `${name}${hasBatchim ? "이" : "가"}`;
}
