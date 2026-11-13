"use client";

import { useRef, useState, type PointerEvent } from "react";

import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";

import RollingPaperWheelCard from "@/widgets/rolling-paper/RollingPaperWheelCard";
import RollingPaperWheelProfile from "@/widgets/rolling-paper/RollingPaperWheelProfile";
import { ARRIVAL_CARD_ENTRANCES } from "@/widgets/rolling-paper/rollingPaperMotion";
import { PX_PER_STEP, WHEEL_ITEM_COUNT, toSnapTarget } from "@/widgets/rolling-paper/wheelGeometry";

const SNAP_SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;
// 등장 모션이 가장 늦게 끝나는 카드(중앙)가 끝나면 드래그를 연다
const LAST_ENTERING_INDEX = 0;
const ITEMS = Array.from({ length: WHEEL_ITEM_COUNT }, (_, index) => index);

// 편지지와 프로필이 하나의 progress를 공유해 세로 드래그로 함께 회전한다
export default function RollingPaperWheel() {
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const [ready, setReady] = useState(reduceMotion);
  const dragRef = useRef<{ startY: number; startProgress: number } | null>(null);
  const snapRef = useRef<AnimationPlaybackControls | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    snapRef.current?.stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startProgress: progress.get() };
  };

  // 손가락을 따라가야 해서 아래로 끌면 progress는 줄어든다
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    progress.set(drag.startProgress - (event.clientY - drag.startY) / PX_PER_STEP);
  };

  const handlePointerEnd = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    const velocity = progress.getVelocity();
    snapRef.current = animate(progress, toSnapTarget(progress.get(), velocity), {
      ...SNAP_SPRING,
      velocity,
    });
  };

  return (
    <div
      data-testid="rolling-paper-wheel"
      className="absolute inset-0 touch-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}>
      {ITEMS.map(index => (
        <RollingPaperWheelCard
          key={`card-${index}`}
          index={index}
          progress={progress}
          entrance={reduceMotion ? null : ARRIVAL_CARD_ENTRANCES[index]}
          onEntered={index === LAST_ENTERING_INDEX ? () => setReady(true) : undefined}
        />
      ))}
      {ITEMS.map(index => (
        <RollingPaperWheelProfile
          key={`profile-${index}`}
          index={index}
          progress={progress}
          animated={!reduceMotion}
        />
      ))}
    </div>
  );
}
