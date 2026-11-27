import { motion, useReducedMotion, type Easing, type Transition } from "framer-motion";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import EmptyIllustration from "@/components/effects/EmptyIllustration";

const STANDARD: Easing = [0.4, 0, 0.2, 1];
const DECELERATE: Easing = [0, 0, 0.2, 1];

const riseIn = (delay: number, opacityDuration: number, yDuration: number): Transition => ({
  opacity: { delay, duration: opacityDuration, ease: STANDARD },
  y: { delay, duration: yDuration, ease: DECELERATE },
});

type FundingRevealEmptyViewProps = {
  isClosing?: boolean;
  onExtend?: () => void;
  onClose: () => void;
};

export default function FundingRevealEmptyView({
  isClosing = false,
  onExtend,
  onClose,
}: FundingRevealEmptyViewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-48">
        <EmptyIllustration />
        <motion.div
          className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={riseIn(0.3, 0.5, 0.55)}>
          <h1 className="text-semantic-text-strong [font:var(--semantic-title-medium)]">
            이번엔 조용히 지나갔어요
          </h1>
          <p className="text-semantic-text-tertiary whitespace-pre-line [font:var(--semantic-label-small-weak)]">
            {"아직 아무도 보태지 않았어요.\n기간을 늘리고 한 번 더 공유해 볼까요?"}
          </p>
        </motion.div>
      </main>
      <BottomCTA direction="vertical">
        <motion.div
          className="flex flex-col gap-2 *:w-full"
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={riseIn(0.95, 0.35, 0.5)}>
          <Button color="brand" size="xlarge" disabled={isClosing} onClick={onExtend}>
            기간 연장하러 가기
          </Button>
          <Button
            color="neutral"
            variant="weak"
            size="xlarge"
            states={isClosing ? "loading" : "default"}
            onClick={onClose}>
            닫기
          </Button>
        </motion.div>
      </BottomCTA>
    </>
  );
}
