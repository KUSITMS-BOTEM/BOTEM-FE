const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const RIEUL_JONGSEONG_INDEX = 8;

// 한글이 아닌 끝글자(영문·숫자 등)는 받침 판별이 불가능해 받침 없음(0)으로 본다
function jongseongIndex(name: string): number {
  const code = name.charCodeAt(name.length - 1);
  return code >= HANGUL_START && code <= HANGUL_END ? (code - HANGUL_START) % JONGSEONG_COUNT : 0;
}

function hasBatchim(name: string): boolean {
  return jongseongIndex(name) !== 0;
}

export function withSubjectParticle(name: string): string {
  return `${name}${hasBatchim(name) ? "이" : "가"}`;
}

export function withObjectParticle(name: string): string {
  return `${name}${hasBatchim(name) ? "을" : "를"}`;
}

export function withVocativeParticle(name: string): string {
  return `${name}${hasBatchim(name) ? "아" : "야"}`;
}

// ㄹ 받침은 받침이 없을 때처럼 '로'를 붙인다 (예: 연필로)
export function withDirectionalParticle(name: string): string {
  const index = jongseongIndex(name);
  return `${name}${index === 0 || index === RIEUL_JONGSEONG_INDEX ? "로" : "으로"}`;
}
