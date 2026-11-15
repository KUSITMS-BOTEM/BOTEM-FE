import LetterPaper, { type LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";

const LETTER_PAPER_WIDTH = 320;

type RollingPaperLetterProps = {
  letter: LetterPaperProps;
  width: number;
};

// 고정 크기(320px) 편지지를 틀 너비에 맞춰 축소해 가운데에 둔다. 사진·아이콘 슬롯만 inert로 막아 본문·발신자는 접근성 트리에 남긴다
export default function RollingPaperLetter({ letter, width }: RollingPaperLetterProps) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ scale: width / LETTER_PAPER_WIDTH }}>
      <LetterPaper {...letter} slotsInert />
    </div>
  );
}
