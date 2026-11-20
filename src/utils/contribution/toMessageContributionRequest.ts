import type { CreateMessageContributionRequest } from "@/types/contribution/contribution";

export type LetterInput = {
  text: string;
  name: string;
  color: string;
  paperStyle: string;
  largeSticker?: { id: string };
  smallSticker?: { id: string };
};

// 서버는 paperTemplateCode를 해석하지 않고 그대로 저장·반환한다. 코드명은 FE가 정한 규칙이다
export const PAPER_STYLE_CODE: Record<string, string> = {
  vividSolid: "VIVID_SOLID",
  colorDot: "COLOR_DOT",
  whiteDot: "WHITE_DOT",
  dotGrid: "DOT_GRID",
  solid: "SOLID",
};

export const toCode = (id: string) => id.toUpperCase().replaceAll("-", "_");

// shortcut: 합성 문자열이라 다른 클라이언트는 `큰|작은` 규칙을 모른다. 백엔드가 필드를 분리하면 교체
const toDecorationCode = (letter: LetterInput) => {
  const { largeSticker, smallSticker } = letter;
  if (!largeSticker && !smallSticker) return undefined;
  return `${largeSticker ? toCode(largeSticker.id) : ""}|${smallSticker ? toCode(smallSticker.id) : ""}`;
};

type Options = {
  requestKey: string;
  // 비회원일 때만 이름·비밀번호를 보낸다
  guestPassword?: string;
};

// 생성·수정이 같은 편지 본문 필드를 보낸다
export const toLetterFields = (letter: LetterInput) => ({
  message: letter.text,
  paperTemplateCode: `${letter.color.toUpperCase()}_${PAPER_STYLE_CODE[letter.paperStyle]}`,
  decorationCode: toDecorationCode(letter),
});

// 사진·음성 URL은 업로드 뒤에 채우므로 여기서는 다루지 않는다
export function toMessageContributionRequest(
  letter: LetterInput,
  { requestKey, guestPassword }: Options,
): CreateMessageContributionRequest {
  return {
    requestKey,
    ...toLetterFields(letter),
    ...(guestPassword !== undefined && { participantName: letter.name, guestPassword }),
  };
}
