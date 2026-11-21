// MSW 전용 공유 키. 실서버의 32자리 값 대신 펀딩 ID를 담아 목 핸들러가 ID로 되돌릴 수 있게 한다
const MOCK_SHARE_KEY_PREFIX = "mock-share-key-";

export const toMockShareKey = (fundingId: number) => `${MOCK_SHARE_KEY_PREFIX}${fundingId}`;

// 주소창에 /share/97처럼 ID만 넣어 확인할 수 있게 숫자만 있는 키도 받는다
export const fromMockShareKey = (shareKey: string) =>
  shareKey.startsWith(MOCK_SHARE_KEY_PREFIX)
    ? Number(shareKey.slice(MOCK_SHARE_KEY_PREFIX.length))
    : /^\d+$/.test(shareKey)
      ? Number(shareKey)
      : Number.NaN;
