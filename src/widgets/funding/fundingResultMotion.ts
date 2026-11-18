import type { Easing, Transition } from "framer-motion";

export function track<V>(
  stops: readonly (readonly [number, V])[],
  ease: Easing | Easing[],
  delay = 0,
): { values: V[]; transition: Transition } {
  const end = stops[stops.length - 1][0];
  return {
    values: stops.map(([, value]) => value),
    transition: { delay, duration: end, times: stops.map(([time]) => time / end), ease },
  };
}

const spring =
  (decay: number, freq: number, ratio: number): Easing =>
  t =>
    1 - Math.exp(-t * decay) * (Math.cos(t * freq) + ratio * Math.sin(t * freq));
const PHOTO_SPRING = spring(7.4137, 11.2576, 0.6586);
const POP_SPRING = spring(7.5258, 8.7987, 0.8553);
const HOLD: Easing = [0.5, 0, 0.5, 1];
const SQUASH_EASE: Easing = [0.3, 0, 0.2, 1];
const STRETCH_EASE: Easing = [0.2, 0.8, 0.4, 1];
export const BURST_EASE: Easing = [0.15, 0.75, 0.35, 1];

// 위시 사진: 등장(0.2~0.8) → 친구가 모이는 동안 조금씩 커짐 → 움츠림(2.13) → 튀어오름(2.31) → 안착(2.45~3.29)
export const PHOTO_SETTLED_SCALE = 0.9;
const PHOTO_SCALE_EASE: Easing[] = [
  HOLD,
  "easeOut",
  "easeInOut",
  PHOTO_SPRING,
  HOLD,
  "easeInOut",
  SQUASH_EASE,
  STRETCH_EASE,
  "easeIn",
  PHOTO_SPRING,
];
const PHOTO_SCALE_TIMES = [0, 0.2, 0.32, 0.44, 0.8, 1.22, 2.13, 2.31, 2.45, 2.59, 3.29] as const;
const zipTimes = (values: number[]) => PHOTO_SCALE_TIMES.map((t, i) => [t, values[i]] as const);

export const PHOTO_SCALE_X = track(
  zipTimes([0, 0, 0.66, 0.495, 0.55, 0.55, 0.62, 0.756, 0.81, 0.972, PHOTO_SETTLED_SCALE]),
  PHOTO_SCALE_EASE,
);
export const PHOTO_SCALE_Y = track(
  zipTimes([0, 0, 0.429, 0.616, 0.55, 0.55, 0.62, 0.459, 1.053, 0.837, PHOTO_SETTLED_SCALE]),
  PHOTO_SCALE_EASE,
);
export const PHOTO_Y = track(
  [
    [0, 0],
    [2.31, 0],
    [2.45, -4],
    [2.59, 1],
    [3.29, 0],
  ],
  ["linear", STRETCH_EASE, "easeIn", PHOTO_SPRING],
);
export const PHOTO_ROTATE = track(
  [
    [0, 0],
    [2.45, 0],
    [2.59, 2],
    [3.29, 0],
  ],
  ["linear", "easeIn", POP_SPRING],
);
export const GRAY_PHOTO_FADE: Transition = { delay: 0.2, duration: 0.2, ease: "easeOut" };
export const GRAY_PHOTO_OPACITY = 0.9;
export const COLOR_PHOTO_AT = 2.38;

// 보탠 친구 수만큼(최대 8명) 사진을 피자처럼 나눠, 친구가 도착할 때마다(0.13초 간격) 한 조각씩 컬러로 채운다. 8명이 넘으면 8조각으로 본다
export const MAX_FRIENDS = 8;
const SLICE_START = 1.19;
const STAGGER = 0.13;
export const sliceFade = (index: number): Transition => ({
  delay: SLICE_START + STAGGER * index,
  duration: 0.23,
  ease: "easeOut",
});

// 12시 방향부터 시계 방향으로 자른 부채꼴. 상품 사진이 API 값이라 clip-path로 자르고, Tailwind가 감지하도록 인원수별 문자열을 미리 적어 둔다
// 1명은 조각 없이 사진 전체가 한 번에 채워진다
export const SLICE_CLIPS: Record<number, string[]> = {
  1: [""],
  2: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_100%,50%_100%)]",
    "[clip-path:polygon(50%_50%,50%_100%,0%_100%,0%_0%,50%_0%)]",
  ],
  3: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_78.87%)]",
    "[clip-path:polygon(50%_50%,100%_78.87%,100%_100%,0%_100%,0%_78.87%)]",
    "[clip-path:polygon(50%_50%,0%_78.87%,0%_0%,50%_0%)]",
  ],
  4: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_50%)]",
    "[clip-path:polygon(50%_50%,100%_50%,100%_100%,50%_100%)]",
    "[clip-path:polygon(50%_50%,50%_100%,0%_100%,0%_50%)]",
    "[clip-path:polygon(50%_50%,0%_50%,0%_0%,50%_0%)]",
  ],
  5: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_33.75%)]",
    "[clip-path:polygon(50%_50%,100%_33.75%,100%_100%,86.33%_100%)]",
    "[clip-path:polygon(50%_50%,86.33%_100%,13.67%_100%)]",
    "[clip-path:polygon(50%_50%,13.67%_100%,0%_100%,0%_33.75%)]",
    "[clip-path:polygon(50%_50%,0%_33.75%,0%_0%,50%_0%)]",
  ],
  6: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_21.13%)]",
    "[clip-path:polygon(50%_50%,100%_21.13%,100%_78.87%)]",
    "[clip-path:polygon(50%_50%,100%_78.87%,100%_100%,50%_100%)]",
    "[clip-path:polygon(50%_50%,50%_100%,0%_100%,0%_78.87%)]",
    "[clip-path:polygon(50%_50%,0%_78.87%,0%_21.13%)]",
    "[clip-path:polygon(50%_50%,0%_21.13%,0%_0%,50%_0%)]",
  ],
  7: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%,100%_10.13%)]",
    "[clip-path:polygon(50%_50%,100%_10.13%,100%_61.41%)]",
    "[clip-path:polygon(50%_50%,100%_61.41%,100%_100%,74.08%_100%)]",
    "[clip-path:polygon(50%_50%,74.08%_100%,25.92%_100%)]",
    "[clip-path:polygon(50%_50%,25.92%_100%,0%_100%,0%_61.41%)]",
    "[clip-path:polygon(50%_50%,0%_61.41%,0%_10.13%)]",
    "[clip-path:polygon(50%_50%,0%_10.13%,0%_0%,50%_0%)]",
  ],
  8: [
    "[clip-path:polygon(50%_50%,50%_0%,100%_0%)]",
    "[clip-path:polygon(50%_50%,100%_0%,100%_50%)]",
    "[clip-path:polygon(50%_50%,100%_50%,100%_100%)]",
    "[clip-path:polygon(50%_50%,100%_100%,50%_100%)]",
    "[clip-path:polygon(50%_50%,50%_100%,0%_100%)]",
    "[clip-path:polygon(50%_50%,0%_100%,0%_50%)]",
    "[clip-path:polygon(50%_50%,0%_50%,0%_0%)]",
    "[clip-path:polygon(50%_50%,0%_0%,50%_0%)]",
  ],
};

const POP_START = 0.15;
const POP_STAGGER = 0.06;
const POP_DURATION = 0.45;
const FLY_START = 0.9;
const FLY_DURATION = 0.32;
const FLOAT_OFFSET = -3;
const PHOTO_CENTER = [166.5, 100] as const;
const LANDING_RADIUS = 27.2;
const MID_RATIO = 0.45;
const MID_LIFT = -20;

export type FriendSpot = {
  className: string;
  center: readonly [number, number];
};

// Figma 친구 점 8자리. 12시 방향부터 시계 방향으로, k번째 자리가 8조각 중 k번째 조각을 맡는다
export const FRIEND_SPOTS: FriendSpot[] = [
  { className: "top-[26.68px] left-[144.69px] size-2", center: [148.69, 30.68] },
  { className: "top-[54.52px] left-[279.24px] size-1.5", center: [282.24, 57.52] },
  { className: "top-[86.26px] left-[309.06px] size-2", center: [313.06, 90.26] },
  { className: "top-[161.92px] left-[232.71px] size-[7px]", center: [236.21, 165.42] },
  { className: "top-[165.32px] left-[181.71px] size-2", center: [185.71, 169.32] },
  { className: "top-[139.48px] left-[39.38px] size-1.5", center: [42.38, 142.48] },
  { className: "top-[106.24px] left-[36.25px] size-[7px]", center: [39.75, 109.74] },
  { className: "top-[31.08px] left-[87.84px] size-[7px]", center: [91.34, 34.58] },
];

const sliceCenterAngle = (index: number, count: number) => ((index + 0.5) * 2 * Math.PI) / count;

export function pickFriendSpot(index: number, count: number) {
  const eighth = Math.PI / 4;
  const spot = Math.round(sliceCenterAngle(index, count) / eighth - 0.5) % FRIEND_SPOTS.length;
  return FRIEND_SPOTS[spot];
}

export function friendFlightPath(index: number, count: number, spot: FriendSpot) {
  const angle = sliceCenterAngle(index, count);
  const end = [
    PHOTO_CENTER[0] + LANDING_RADIUS * Math.sin(angle) - spot.center[0],
    PHOTO_CENTER[1] - LANDING_RADIUS * Math.cos(angle) - spot.center[1],
  ] as const;
  const mid = [end[0] * MID_RATIO, end[1] * MID_RATIO + MID_LIFT] as const;
  return { mid, end };
}

type FlightPath = ReturnType<typeof friendFlightPath>;

export function friendDotTracks(index: number, { mid, end }: FlightPath) {
  const popStart = POP_START + POP_STAGGER * index;
  const popEnd = popStart + POP_DURATION;
  const flyStart = FLY_START + STAGGER * index;
  const flyMid = flyStart + FLY_DURATION / 2;
  const arrive = flyStart + FLY_DURATION;

  return {
    scale: track(
      [
        [0, 0],
        [popStart, 0],
        [popEnd, 1],
        [flyMid, 1.15],
        [arrive, 0.4],
      ],
      [HOLD, POP_SPRING, "easeOut", "easeIn"],
    ),
    x: track(
      [
        [0, 0],
        [flyStart, 0],
        [flyMid, mid[0]],
        [arrive, end[0]],
      ],
      ["linear", "easeOut", "easeIn"],
    ),
    y: track(
      [
        [0, 0],
        [popEnd, 0],
        [(popEnd + flyStart) / 2, FLOAT_OFFSET],
        [flyStart, 0],
        [flyMid, mid[1]],
        [arrive, end[1]],
      ],
      [HOLD, "easeInOut", "easeInOut", "easeOut", "easeIn"],
    ),
    opacity: { values: [1, 0], transition: { delay: arrive, duration: 0 } as Transition },
    reveal: {
      values: [0, 1],
      transition: { delay: flyStart, duration: FLY_DURATION / 2, ease: "easeOut" } as Transition,
    },
  };
}

// 컨페티: 사진이 튀어오를 때(약 2.45초) 가운데에서 0.4초 동안 사방으로 퍼진 뒤, 아래로 160px 떨어지며 회전하고 끝 0.4초 동안 사라진다
const BURST_DURATION = 0.4;
const FALL_END = 1.8;
const FADE_START = 1.4;
const FALL_DISTANCE = 160;
const FALL_SPREAD = 1.2;

export type ConfettiShape = "streamer" | "strip" | "dot";
export type ConfettiColor = "lime" | "pink" | "blue";

export type ConfettiPiece = {
  shape: ConfettiShape;
  color: ConfettiColor;
  at: number;
  x: number;
  y: number;
  rotate: number;
};

export function confettiTracks({ shape, at, x, y, rotate }: ConfettiPiece) {
  return {
    x: track(
      [
        [0, 0],
        [BURST_DURATION, x],
        [FALL_END, x * FALL_SPREAD],
      ],
      [BURST_EASE, "easeOut"],
      at,
    ),
    y: track(
      [
        [0, 0],
        [BURST_DURATION, y],
        [FALL_END, y + FALL_DISTANCE],
      ],
      [BURST_EASE, "easeIn"],
      at,
    ),
    rotate: track(
      [
        [0, 0],
        [FALL_END, rotate],
      ],
      "easeOut",
      at,
    ),
    opacity: track(
      [
        [0, 1],
        [FADE_START, 1],
        [FALL_END, 0],
      ],
      "linear",
      at,
    ),
    scaleY:
      shape === "streamer"
        ? track(
            [
              [0, 0.4],
              [BURST_DURATION, 1.2],
              [0.9, 0.6],
              [FALL_END, 1],
            ],
            [BURST_EASE, "easeInOut", "easeInOut"],
            at,
          )
        : undefined,
  };
}

// get_motion_context에서 뽑은 40개 조각(streamer 8 · strip 15 · dot 17). 낙하 지점은 버스트 지점에서 계산한다(x×1.2, y+160)
export const CONFETTI_PIECES: ConfettiPiece[] = [
  { shape: "streamer", color: "lime", at: 2.498, x: 50.6, y: 32.7, rotate: 560 },
  { shape: "streamer", color: "pink", at: 2.487, x: -8.1, y: -80.5, rotate: -596 },
  { shape: "streamer", color: "blue", at: 2.433, x: -155.5, y: -51.1, rotate: 580 },
  { shape: "streamer", color: "lime", at: 2.432, x: -158.6, y: 1.6, rotate: -832 },
  { shape: "streamer", color: "pink", at: 2.488, x: -34.7, y: 94.1, rotate: 612 },
  { shape: "streamer", color: "blue", at: 2.436, x: 85.8, y: -100.5, rotate: -608 },
  { shape: "streamer", color: "lime", at: 2.448, x: 3.5, y: -111.8, rotate: 785 },
  { shape: "streamer", color: "pink", at: 2.44, x: -196.4, y: -22.2, rotate: -875 },
  { shape: "strip", color: "blue", at: 2.477, x: -195.5, y: -33.5, rotate: 782 },
  { shape: "dot", color: "lime", at: 2.459, x: -194.9, y: -32.5, rotate: -891 },
  { shape: "dot", color: "pink", at: 2.482, x: 169.7, y: -10.1, rotate: 854 },
  { shape: "strip", color: "blue", at: 2.489, x: -203.8, y: -82.3, rotate: -730 },
  { shape: "strip", color: "lime", at: 2.479, x: -175.9, y: -88.9, rotate: 872 },
  { shape: "dot", color: "pink", at: 2.492, x: -119.4, y: 19.8, rotate: -729 },
  { shape: "dot", color: "blue", at: 2.464, x: 128.8, y: -103.8, rotate: 655 },
  { shape: "dot", color: "lime", at: 2.488, x: -113.3, y: 62.4, rotate: -787 },
  { shape: "strip", color: "pink", at: 2.452, x: -220.2, y: 34.5, rotate: 734 },
  { shape: "strip", color: "blue", at: 2.492, x: 13.9, y: 64.5, rotate: -708 },
  { shape: "dot", color: "lime", at: 2.478, x: 244.2, y: -29.1, rotate: 554 },
  { shape: "dot", color: "pink", at: 2.496, x: -46.7, y: -104.8, rotate: -864 },
  { shape: "dot", color: "blue", at: 2.471, x: 126.7, y: -86.6, rotate: 878 },
  { shape: "strip", color: "lime", at: 2.492, x: 111.9, y: -90.0, rotate: -763 },
  { shape: "strip", color: "pink", at: 2.444, x: 128.8, y: -3.2, rotate: 820 },
  { shape: "dot", color: "blue", at: 2.444, x: -91.1, y: -64.2, rotate: -764 },
  { shape: "dot", color: "lime", at: 2.473, x: 160.4, y: -53.2, rotate: 818 },
  { shape: "dot", color: "pink", at: 2.435, x: 32.6, y: 90.3, rotate: -835 },
  { shape: "strip", color: "blue", at: 2.493, x: 19.7, y: -111.8, rotate: 654 },
  { shape: "dot", color: "lime", at: 2.486, x: 78.8, y: 34.0, rotate: -603 },
  { shape: "strip", color: "pink", at: 2.489, x: 164.7, y: -67.5, rotate: 880 },
  { shape: "dot", color: "blue", at: 2.447, x: 97.8, y: 73.9, rotate: -897 },
  { shape: "strip", color: "lime", at: 2.454, x: -67.8, y: 27.3, rotate: 775 },
  { shape: "strip", color: "pink", at: 2.474, x: -188.9, y: -57.3, rotate: -876 },
  { shape: "strip", color: "blue", at: 2.471, x: -84.3, y: 23.1, rotate: 751 },
  { shape: "dot", color: "lime", at: 2.462, x: -142.8, y: 25.7, rotate: -783 },
  { shape: "dot", color: "pink", at: 2.439, x: -132.2, y: -49.1, rotate: 771 },
  { shape: "strip", color: "blue", at: 2.448, x: 164.1, y: 47.1, rotate: -623 },
  { shape: "strip", color: "lime", at: 2.497, x: -139.0, y: -98.0, rotate: 820 },
  { shape: "dot", color: "pink", at: 2.499, x: 222.6, y: -46.2, rotate: -854 },
  { shape: "strip", color: "blue", at: 2.44, x: 1.3, y: 65.1, rotate: 880 },
  { shape: "dot", color: "lime", at: 2.493, x: -13.7, y: 63.3, rotate: -635 },
];
