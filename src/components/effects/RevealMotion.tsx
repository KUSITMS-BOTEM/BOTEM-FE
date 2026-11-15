"use client";

import { motion, useReducedMotion, type Easing, type Transition } from "framer-motion";
import { cn } from "@/utils/cn";
import ConfettiBit, { type ConfettiBitKind } from "@/components/effects/ConfettiBit";

const TIMELINE_S = 7;
const RAD_TO_DEG = 180 / Math.PI;
const at = (seconds: number) => seconds / TIMELINE_S;
const POP = 0.0001;

const once = (times: number[], ease: Easing | Easing[]): Transition => ({
  duration: TIMELINE_S,
  times,
  ease,
});

type MotionPreset = {
  initial: Record<string, number>;
  animate: Record<string, number[]>;
  transition: Record<string, Transition>;
};

type ConfettiShape = { kind: ConfettiBitKind; style: string };

const SHAPES: ConfettiShape[] = [
  { kind: "circle", style: "size-1.5 bg-base-orange-500" },
  { kind: "bar", style: "h-[13px] w-1 bg-base-lime-500" },
  { kind: "star", style: "size-2.5 bg-base-pink-500" },
  { kind: "circle", style: "size-[7px] bg-base-blue-500" },
  { kind: "bar", style: "h-2.5 w-1 bg-base-orange-500" },
  { kind: "star", style: "size-2.5 bg-base-lime-500" },
  { kind: "circle", style: "size-2 bg-base-pink-500" },
  { kind: "bar", style: "h-[13px] w-1 bg-base-blue-500" },
  { kind: "star", style: "size-3 bg-base-orange-500" },
  { kind: "circle", style: "size-[7px] bg-base-lime-500" },
  { kind: "bar", style: "h-3 w-1 bg-base-pink-500" },
  { kind: "star", style: "size-2.5 bg-base-blue-500" },
  { kind: "circle", style: "size-[7px] bg-base-orange-500" },
  { kind: "bar", style: "h-[11px] w-1 bg-base-lime-500" },
];

type RainBit = { left: string; start: number; end: number; rotate: number; driftX: number };

const RAIN: RainBit[] = [
  { left: "left-[24.93px]", start: 0.1723, end: 0.523, rotate: -9.350904, driftX: 11.57901 },
  { left: "left-[32.08px]", start: 0.188, end: 0.5647, rotate: 7.469449, driftX: 3.616752 },
  { left: "left-[66.27px]", start: 0.1979, end: 0.5556, rotate: -7.33005, driftX: -19.898621 },
  { left: "left-[80.05px]", start: 0.1897, end: 0.4999, rotate: 11.843488, driftX: 0.416405 },
  { left: "left-[96.3px]", start: 0.2289, end: 0.6003, rotate: -10.356398, driftX: 8.533518 },
  { left: "left-[128.25px]", start: 0.1704, end: 0.536, rotate: -11.283764, driftX: -12.768319 },
  { left: "left-[145.72px]", start: 0.2361, end: 0.5669, rotate: 11.64852, driftX: -1.55998 },
  { left: "left-[164.51px]", start: 0.195, end: 0.5483, rotate: 10.251104, driftX: 9.060508 },
  { left: "left-[193.73px]", start: 0.1643, end: 0.4807, rotate: -11.335127, driftX: 4.942041 },
  { left: "left-[208.6px]", start: 0.1657, end: 0.469, rotate: 7.028796, driftX: -16.107756 },
  { left: "left-[232.16px]", start: 0.1956, end: 0.5433, rotate: -10.646829, driftX: 7.173124 },
  { left: "left-[262.97px]", start: 0.2329, end: 0.5294, rotate: -9.795177, driftX: -11.36339 },
  { left: "left-[272.23px]", start: 0.1746, end: 0.4881, rotate: 11.069859, driftX: 11.292038 },
  { left: "left-[304.38px]", start: 0.2069, end: 0.553, rotate: -11.267387, driftX: -9.587573 },
];

const RAIN_FALL_PX = 340;

const rainPreset = ({ start, end, rotate, driftX }: RainBit): MotionPreset => ({
  initial: { x: 0, y: 0, rotate: 0, opacity: 0 },
  animate: {
    rotate: [0, 0, rotate * RAD_TO_DEG, 0],
    x: [0, 0, driftX, driftX * -0.4, driftX * -0.4],
    y: [0, 0, RAIN_FALL_PX, RAIN_FALL_PX],
    opacity: [0, 0, 0.75, 0.75, 0, 0],
  },
  transition: {
    rotate: once([0, start, end, 1], "linear"),
    x: once([0, start, (start + end) / 2, end, 1], ["linear", "easeInOut", "easeInOut", "linear"]),
    y: once([0, start, end, 1], ["linear", [0.4, 0, 0.8, 1], "linear"]),
    opacity: once([0, start - POP, start, end - at(0.3), end, 1], "linear"),
  },
});

type BurstBit = { start: number; peakX: number; peakY: number; rotate: number };

const BURST: BurstBit[] = [
  { start: 0.1379, peakX: 163.933823, peakY: 95.752998, rotate: 13.830382 },
  { start: 0.1384, peakX: -54.948238, peakY: -143.922806, rotate: 9.841278 },
  { start: 0.14, peakX: -182.919235, peakY: -104.383957, rotate: 10.735093 },
  { start: 0.1456, peakX: -33.137985, peakY: -114.157753, rotate: 7.92347 },
  { start: 0.1416, peakX: -129.45549, peakY: 70.855804, rotate: 12.607463 },
  { start: 0.1419, peakX: -134.042465, peakY: -58.891842, rotate: 8.001396 },
  { start: 0.1444, peakX: 89.72757, peakY: -202.79744, rotate: 14.49108 },
  { start: 0.1357, peakX: 65.22332, peakY: -159.920334, rotate: 14.418729 },
  { start: 0.1424, peakX: -32.552002, peakY: -116.406593, rotate: 15.070101 },
  { start: 0.1361, peakX: 144.156952, peakY: 69.261284, rotate: 11.753716 },
  { start: 0.1426, peakX: 178.874847, peakY: 113.872711, rotate: 6.933923 },
  { start: 0.1389, peakX: -122.565865, peakY: -52.621445, rotate: 7.305874 },
  { start: 0.1376, peakX: -23.022804, peakY: -108.55851, rotate: 7.149658 },
  { start: 0.1364, peakX: -66.732292, peakY: -74.638771, rotate: 11.683502 },
  { start: 0.1404, peakX: 105.583496, peakY: -122.991768, rotate: 14.502505 },
  { start: 0.1423, peakX: -155.596954, peakY: 24.672466, rotate: 13.195359 },
  { start: 0.139, peakX: -109.249908, peakY: -5.360867, rotate: 10.862293 },
  { start: 0.1376, peakX: 92.995949, peakY: -53.868687, rotate: 9.585463 },
  { start: 0.1429, peakX: 195.457123, peakY: -34.220013, rotate: 10.472676 },
  { start: 0.1383, peakX: -82.957214, peakY: 71.319733, rotate: 13.181667 },
  { start: 0.1366, peakX: -10.345897, peakY: -203.028473, rotate: 13.042942 },
  { start: 0.139, peakX: -152.212631, peakY: -114.80201, rotate: 13.122906 },
];

const BURST_FALL_PX = 300;
const BURST_FLIGHT: Easing = [0.15, 0.7, 0.35, 1];
const burstPreset = ({ start, peakX, peakY, rotate }: BurstBit): MotionPreset => {
  const end = start + at(1.9);
  const moveTimes = [0, start, start + at(0.5), end, 1];
  const spin = rotate * RAD_TO_DEG;

  return {
    initial: { scale: 0.3, x: 0, y: 0, rotate: 0, opacity: 0 },
    animate: {
      scale: [0.3, 0.3, 1, 1],
      rotate: [0, 0, spin, spin],
      x: [0, 0, peakX, peakX * 1.3, peakX * 1.3],
      y: [0, 0, peakY, peakY + BURST_FALL_PX, peakY + BURST_FALL_PX],
      opacity: [0, 0, 0.75, 0.75, 0, 0],
    },
    transition: {
      scale: once([0, start, start + at(0.2), 1], ["linear", "easeOut", "linear"]),
      rotate: once([0, start, end, 1], ["linear", "easeOut", "linear"]),
      x: once(moveTimes, ["linear", BURST_FLIGHT, "easeOut", "linear"]),
      y: once(moveTimes, ["linear", BURST_FLIGHT, "easeIn", "linear"]),
      opacity: once([0, start - POP, start, start + at(1.1), end, 1], "linear"),
    },
  };
};

type NameSlot = {
  from: [number, number];
  peak: [number, number];
  rotate: [number, number];
};

const NAME_SLOTS: NameSlot[] = [
  { from: [107.904861, -95.986679], peak: [46.431793, -222.040588], rotate: [-3.351202, 0.092613] },
  { from: [32.861702, -95.175499], peak: [17.021164, -240.508362], rotate: [2.61923, -0.057307] },
  {
    from: [-34.318539, -96.333931],
    peak: [-13.130992, -219.746048],
    rotate: [-2.581346, 0.085854],
  },
  {
    from: [-103.874352, -95.639748],
    peak: [-40.015453, -239.563828],
    rotate: [3.234383, 0.093671],
  },
  { from: [75.472893, -68.563423], peak: [30.364237, -204.532135], rotate: [-2.267139, 0.17127] },
  { from: [1.148746, -67.512711], peak: [0.605287, -195.835159], rotate: [2.896118, 0.163142] },
  { from: [-66.214745, -66.629288], peak: [-31.804752, -193.389175], rotate: [-3.46232, 0.130441] },
  { from: [9.120364, -39.017776], peak: [3.850141, -192.793213], rotate: [-3.393703, 0.036219] },
];

const NAME_COLORS = [
  "bg-semantic-fill-brand-weak text-semantic-fill-brand",
  "bg-semantic-fill-lime text-base-gray-900",
  "bg-semantic-fill-pink-weak text-semantic-fill-pink",
  "bg-semantic-fill-blue-weak text-semantic-fill-blue",
];

// 아랫줄부터 4·3·1명씩 쌓는 피라미드
const NAME_ROWS = [
  { first: 0, capacity: 4, top: "top-[252px]" },
  { first: 4, capacity: 3, top: "top-[223.5px]" },
  { first: 7, capacity: 1, top: "top-[195px]" },
];
const MAX_REVEAL_NAMES = NAME_SLOTS.length;

const NAME_PITCH_PX = 72;
const PEAK_X_RATIO = 0.45;

const namePreset = (slot: number, vacancy: number): MotionPreset => {
  const { from, peak, rotate } = NAME_SLOTS[slot]!;
  const shift = (vacancy * NAME_PITCH_PX) / 2;
  const fromX = from[0] - shift;
  const peakX = peak[0] - shift * PEAK_X_RATIO;
  const start = at(0.5 + 0.04 * slot);
  const top = start + at(0.38);
  const land = at(1.4 + 0.08 * slot);
  const flightTimes = [0, start, top, land, 1];
  const tilt = rotate[1] * RAD_TO_DEG;

  return {
    initial: { scale: 0.5, x: fromX, y: from[1], rotate: 0, opacity: 0 },
    animate: {
      scale: [0.5, 0.5, 1, 1],
      rotate: [0, 0, rotate[0] * RAD_TO_DEG, tilt, tilt],
      x: [fromX, fromX, peakX, 0, 0],
      y: [from[1], from[1], peak[1], 0, -9, 0, -2, 0, 0],
      opacity: [0, 0, 1, 1],
    },
    transition: {
      scale: once([0, start, start + at(0.25), 1], ["linear", "easeOut", "linear"]),
      rotate: once(flightTimes, ["linear", "easeOut", "easeOut", "linear"]),
      x: once(flightTimes, ["linear", "easeOut", "easeInOut", "linear"]),
      y: once(
        [
          0,
          start,
          top,
          land,
          land + at(0.12),
          land + at(0.24),
          land + at(0.32),
          land + at(0.38),
          1,
        ],
        [
          "linear",
          [0.2, 0.8, 0.4, 1],
          [0.55, 0, 0.9, 0.6],
          "easeOut",
          "easeIn",
          "easeOut",
          "easeIn",
          "linear",
        ],
      ),
      opacity: once([0, start - POP, start, 1], "linear"),
    },
  };
};

type RevealMotionProps = {
  // 보탠 친구 이름. 앞에서부터 8명까지만 칩으로 보여준다
  names: string[];
  className?: string;
};

export default function RevealMotion({ names, className }: RevealMotionProps) {
  const reduceMotion = useReducedMotion();
  const shown = names.slice(0, MAX_REVEAL_NAMES);

  const rows = NAME_ROWS.map(row => ({
    ...row,
    names: shown.slice(row.first, row.first + row.capacity),
  })).filter(row => row.names.length > 0);

  return (
    <div
      className={cn(
        "bg-semantic-background-floated relative h-75 w-80 shrink-0 overflow-clip rounded-3xl",
        className,
      )}>
      {!reduceMotion && (
        <div aria-hidden className="absolute inset-0">
          {RAIN.map((bit, index) => (
            <motion.div
              key={bit.left}
              {...rainPreset(bit)}
              className={cn("absolute -top-6", bit.left)}>
              <ConfettiBit kind={SHAPES[index]!.kind} className={SHAPES[index]!.style} />
            </motion.div>
          ))}
          <div className="absolute top-[174px] left-40 grid size-0 place-items-center *:col-start-1 *:row-start-1">
            {BURST.map((bit, index) => {
              const shape = SHAPES[index % SHAPES.length]!;
              return (
                <motion.div key={index} {...burstPreset(bit)}>
                  <ConfettiBit kind={shape.kind} className={shape.style} />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      {rows.map(row => (
        <ul key={row.top} className={cn("absolute inset-x-0 flex justify-center gap-1", row.top)}>
          {row.names.map((name, index) => {
            const slot = row.first + index;
            return (
              <motion.li
                key={slot}
                {...(reduceMotion ? {} : namePreset(slot, row.capacity - row.names.length))}
                className={cn(
                  "flex min-w-0 items-center justify-center rounded-full px-4 py-[7px]",
                  NAME_COLORS[slot % NAME_COLORS.length],
                )}>
                <span className="truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small-strong)]">
                  {name}
                </span>
              </motion.li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
