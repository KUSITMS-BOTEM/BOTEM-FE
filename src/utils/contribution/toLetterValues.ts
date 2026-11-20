import type { Color } from "@/constants/color";
import type { LetterPaperStyle } from "@/constants/letterPaperStyle";
import { PAPER_STYLE_CODE, toCode } from "@/utils/contribution/toMessageContributionRequest";
import type { LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";
import { STICKERS } from "@/widgets/letter-paper/stickers";

const COLORS: Color[] = ["orange", "pink", "lime", "blue"];

type SavedLetter = {
  participantName: string;
  message: string | null;
  paperTemplateCode: string | null;
  decorationCode: string | null;
};

const findSticker = (code?: string) => STICKERS.find(({ id }) => toCode(id) === code);

// toMessageContributionRequest의 역변환. 우리 규칙(`색_스타일`, `큰|작은`)에 안 맞는 코드는 기본 편지지·스티커 없음으로 둔다
export function toLetterValues(saved: SavedLetter): LetterWriteValues {
  const [colorCode, ...styleCode] = (saved.paperTemplateCode ?? "").split("_");
  const color = COLORS.find(c => c === colorCode.toLowerCase()) ?? "orange";
  const paperStyle =
    (Object.keys(PAPER_STYLE_CODE) as LetterPaperStyle[]).find(
      style => PAPER_STYLE_CODE[style] === styleCode.join("_"),
    ) ?? "vividSolid";
  const [large, small] = (saved.decorationCode ?? "").split("|");
  const largeSticker = findSticker(large);
  const smallSticker = findSticker(small);
  return {
    text: saved.message ?? "",
    name: saved.participantName,
    color,
    paperStyle,
    ...(largeSticker && { largeSticker }),
    ...(smallSticker && { smallSticker }),
  };
}
