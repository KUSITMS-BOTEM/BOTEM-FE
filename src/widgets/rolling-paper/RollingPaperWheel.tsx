"use client";

import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";

// TODO: 임시 Play 버튼. 디자이너의 VoicePlayer·PlayButton 컴포넌트가 나와 분리할 때 이 import와 아래 사용처를 함께 제거할 것
import IconPlayButton from "@/assets/icons/multicolor/icon-play-button.svg?react";
import RollingPaperWheelCard from "@/widgets/rolling-paper/RollingPaperWheelCard";
import RollingPaperWheelProfile from "@/widgets/rolling-paper/RollingPaperWheelProfile";
import {
  ARRIVAL_CARD_ENTRANCES,
  CARD_LAYER_VARIANTS,
  PROFILE_LAYER_VARIANTS,
  VOICE_PLAYER_VARIANTS,
} from "@/widgets/rolling-paper/rollingPaperMotion";
import {
  PX_PER_STEP,
  WHEEL_ITEM_COUNT,
  clampProgress,
  toSnapTarget,
  toWheelOffset,
} from "@/widgets/rolling-paper/wheelGeometry";

const SNAP_SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;
// 등장 모션이 가장 늦게 끝나는 카드(중앙)가 끝나면 드래그를 연다
const LAST_ENTERING_INDEX = 0;
// 위로 끌면 progress가 늘어나므로 아래/위 방향키를 다음/이전 카드로 맞춘다
const KEY_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
// 이 거리(px)를 넘게 움직여야 탭이 아닌 드래그로 본다
const DRAG_THRESHOLD = 6;

type DragState = { startY: number; startProgress: number; moved: boolean };

// 편지지와 프로필이 하나의 progress를 공유해 세로 드래그로 함께 회전한다
type RollingPaperWheelProps = {
  count: number;
};

// 5개 미만은 순환 없이 양 끝에서 멈추고, 1개는 드래그해도 움직이지 않는다
export default function RollingPaperWheel({ count }: RollingPaperWheelProps) {
  const itemCount = Math.min(count, WHEEL_ITEM_COUNT);
  const items = Array.from({ length: itemCount }, (_, index) => index);
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [ready, setReady] = useState(reduceMotion);
  // 확대되면 편지지가 커지고 프로필이 숨겨지며 Voice Player가 올라온다
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  // 터치는 드래그 뒤에도 click이 올 수 있어, 직전 제스처가 드래그였는지 기억해 카드 탭으로 오인하지 않게 한다
  const movedRef = useRef(false);
  const snapRef = useRef<AnimationPlaybackControls | null>(null);

  const expand = () => setExpanded(true);
  const collapse = () => setExpanded(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    movedRef.current = false;
    if (!ready || expanded) return;
    snapRef.current?.stop();
    dragRef.current = { startY: event.clientY, startProgress: progress.get(), moved: false };
  };

  // 손가락을 따라가야 해서 아래로 끌면 progress는 줄어든다
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const distance = event.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.abs(distance) < DRAG_THRESHOLD) return;
      drag.moved = true;
      // 탭의 click이 카드에 닿도록 포인터 캡처는 드래그가 확정된 뒤에 건다
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    progress.set(clampProgress(drag.startProgress - distance / PX_PER_STEP, itemCount));
  };

  const handlePointerEnd = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    movedRef.current = drag.moved;
    const velocity = progress.getVelocity();
    snapRef.current = animate(
      progress,
      clampProgress(toSnapTarget(progress.get(), velocity), itemCount),
      { ...SNAP_SPRING, velocity },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      collapse();
      return;
    }
    if (!ready) return;
    if (event.key === "Enter") {
      event.preventDefault();
      expand();
      return;
    }
    const step = KEY_STEPS[event.key];
    if (!step || expanded) return;
    event.preventDefault();
    snapRef.current?.stop();
    snapRef.current = animate(
      progress,
      clampProgress(Math.round(progress.get()) + step, itemCount),
      SNAP_SPRING,
    );
  };

  // 가운데 편지지를 탭하면 확대하고, 위·아래 편지지를 탭하면 그 편지지가 가운데로 오게 한다.
  // 확대된 뒤에도 가운데 편지지 탭은 닫히지 않게 전파를 막고, 확대 중 다른 편지지 탭은 전파시켜 닫는다
  const handleCardClick = (event: MouseEvent<HTMLDivElement>, index: number) => {
    if (movedRef.current) return;
    const offset = toWheelOffset(index, progress.get(), itemCount);
    if (Math.abs(offset) < 0.5) {
      event.stopPropagation();
      expand();
      return;
    }
    if (expanded || !ready) return;
    event.stopPropagation();
    snapRef.current?.stop();
    snapRef.current = animate(
      progress,
      clampProgress(progress.get() + offset, itemCount),
      SNAP_SPRING,
    );
  };

  return (
    <div
      data-testid="rolling-paper-wheel"
      role="group"
      aria-label="롤링페이퍼 편지지 목록. 위아래 방향키로 이동"
      tabIndex={0}
      className="absolute inset-0 touch-none overflow-hidden"
      onKeyDown={handleKeyDown}
      onClick={() => expanded && collapse()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}>
      <MotionConfig reducedMotion="user">
        {/* 확대 기준점은 가운데 편지지 중심(휠 중심에서 왼쪽 30px) */}
        <motion.div
          data-testid="wheel-card-layer"
          className="absolute inset-0 origin-[calc(50%_-_30px)_50%]"
          variants={CARD_LAYER_VARIANTS}
          initial={false}
          animate={expanded ? "expanded" : "collapsed"}>
          {items.map(index => (
            <RollingPaperWheelCard
              key={`card-${index}`}
              index={index}
              count={itemCount}
              progress={progress}
              entrance={reduceMotion ? null : ARRIVAL_CARD_ENTRANCES[index]}
              onEntered={index === LAST_ENTERING_INDEX ? () => setReady(true) : undefined}
              onClick={event => handleCardClick(event, index)}
            />
          ))}
        </motion.div>
        <motion.div
          data-testid="wheel-profile-layer"
          className="pointer-events-none absolute inset-0"
          variants={PROFILE_LAYER_VARIANTS}
          initial={false}
          animate={expanded ? "hidden" : "visible"}>
          {items.map(index => (
            <RollingPaperWheelProfile
              key={`profile-${index}`}
              index={index}
              count={itemCount}
              progress={progress}
              animated={!reduceMotion}
            />
          ))}
        </motion.div>
        {/* TODO: 디자이너의 VoicePlayer 컴포넌트가 나오면 분리 예정. 그 전까지는 문구·크기를 하드코딩한다 */}
        <motion.div
          data-testid="voice-player"
          aria-hidden={!expanded}
          className="bg-semantic-fill-default/70 absolute inset-x-[17px] bottom-[86px] flex flex-col gap-5 rounded-[17px] px-4 pt-4 pb-3 shadow-[0px_4px_16px_0px_var(--color-semantic-shadow-weak)]"
          variants={VOICE_PLAYER_VARIANTS}
          initial={false}
          animate={expanded ? "shown" : "hidden"}
          onClick={event => event.stopPropagation()}>
          <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] opacity-[0.37] [font:var(--semantic-label-small-strong)]">
            지유야 생일 진짜 축하해! 올해는 꼭 같이 여행 가자. 선물 잘 쓰고 맛있는 것도 많이 먹어.
            사랑해!
          </p>
          <div className="flex items-center justify-between">
            <p className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              23초 · 민지님의 녹음
            </p>
            <IconPlayButton className="size-7.5" />
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
