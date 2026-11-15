import LetterPaper, { type LetterPaperProps } from "@/widgets/letter-paper/LetterPaper";

const LETTER_PAPER_WIDTH = 320;

type RollingPaperLetterProps = {
  letter: LetterPaperProps;
  width: number;
};

// 고정 크기(320px) 편지지를 틀 너비에 맞춰 축소해 가운데에 둔다. 장식용이라 사진·아이콘 슬롯이 눌리거나 포커스를 받지 않도록 막는다
export default function RollingPaperLetter({ letter, width }: RollingPaperLetterProps) {
  return (
    <div
      inert
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ scale: width / LETTER_PAPER_WIDTH }}>
      <LetterPaper {...letter} />
    </div>
  );
}
