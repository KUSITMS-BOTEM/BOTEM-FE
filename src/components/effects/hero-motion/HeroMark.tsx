"use client";

import { motion } from "framer-motion";
import Star from "@/assets/images/hero/star.svg?react";
import SquareBlue from "@/assets/images/hero/square-blue.svg?react";
import SquareLime from "@/assets/images/hero/square-lime.svg?react";
import SquarePink from "@/assets/images/hero/square-pink.svg?react";
import { HERO_TRACKS } from "./heroMotionData";
import { toMotion, type HeroTrackSet } from "./heroMotionTrack";

const { mark, star, squareLime, squarePink, squareBlue, glint } = HERO_TRACKS;
const { sx: markSx, sy: markSy, ...markMove } = mark;

// 별 모양 반짝임 마스크는 CSS mask-image가 URL을 요구해서 public에 둔다
const GLINT_MASK =
  "[mask-image:url(/hero/star-glint.svg)] [mask-size:100%_100%] [mask-repeat:no-repeat]";

// 기울기는 정적 회전값이라 initial에만 넣는다 (framer는 scale 다음에 rotate를 적용해 Figma의 화면축 눌림과 같다)
const tilted = (tracks: HeroTrackSet, playing: boolean, deg: number) => {
  const motion = toMotion(tracks, playing);
  return { ...motion, initial: { ...motion.initial, rotate: deg } };
};

type HeroMarkProps = {
  playing: boolean;
};

export default function HeroMark({ playing }: HeroMarkProps) {
  return (
    // Figma 순서: 회전(바깥) → 눌림(안쪽)
    <motion.div
      {...toMotion(markMove, playing)}
      className="absolute top-[78px] left-[79px] h-30 w-33.25 origin-center">
      <motion.div
        {...toMotion({ sx: markSx, sy: markSy }, playing)}
        className="absolute inset-0 origin-center">
        <motion.div
          {...toMotion(star, playing)}
          className="absolute top-0 left-[23.55px] h-30 w-[98.64px] origin-center">
          <Star className="size-full" />
        </motion.div>
        {/* 사각형은 화면축 기준으로 눌리고 -38° 기울어져 있다 */}
        <motion.div
          {...tilted(squareLime, playing, -38)}
          className="absolute top-[105.43px] left-[107.8px] size-[10.852px] origin-center">
          <SquareLime className="size-full" />
        </motion.div>
        <motion.div
          {...tilted(squarePink, playing, -38)}
          className="absolute top-[11.4px] left-[116.8px] size-[13.705px] origin-center">
          <SquarePink className="size-full" />
        </motion.div>
        <motion.div
          {...tilted(squareBlue, playing, -38)}
          className="absolute top-[16.37px] left-[3.99px] size-[19.753px] origin-center">
          <SquareBlue className="size-full" />
        </motion.div>
        {playing && (
          <div
            className={`absolute top-0 left-[23.55px] h-30 w-[98.64px] overflow-hidden ${GLINT_MASK}`}>
            <motion.div
              {...tilted(glint, true, -22)}
              className="from-base-gray-0/0 via-base-gray-0/75 to-base-gray-0/0 absolute top-[-50px] left-[-106.55px] h-[220px] w-[46px] origin-center bg-linear-to-r"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
