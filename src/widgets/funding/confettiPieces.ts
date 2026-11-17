export type ConfettiColor = "blue" | "pink" | "lime" | "orange" | "yellow";

type ConfettiShape = { svg: number } | { pill: ConfettiColor; vertical: boolean };

export type ConfettiPiece = ConfettiShape & {
  /** 조각 중심 좌표(px). 스테이지 좌상단 기준 */
  cx: number;
  cy: number;
  /** 디자인상 기울기(deg) */
  deg: number;
  /** 낙하 시작 시각·낙하 시간(초) */
  delay: number;
  duration: number;
  /** 낙하 중 좌우 이동(px)과 누적 회전(deg) */
  dx: number;
  spin: number;
};

// Figma "전체 모션 참고" 12.2초 타임라인의 컨페티 22개를 옮긴 값이다.
// 한 번만 재생하므로 원본의 두 번째 낙하(루프 구간)는 옮기지 않았다
export const CONFETTI_PIECES: ConfettiPiece[] = [
  { cx: 3.3, cy: -47.3, deg: -178, svg: 0, delay: 2.6, duration: 6.36, dx: 14, spin: 158 },
  {
    cx: 136.6,
    cy: -60.1,
    deg: -113,
    pill: "blue",
    vertical: true,
    delay: 2.86,
    duration: 4.98,
    dx: 1,
    spin: -123,
  },
  { cx: 247.5, cy: -59.1, deg: -41, svg: 1, delay: 4.69, duration: 5.52, dx: 7, spin: 255 },
  {
    cx: 337.2,
    cy: -31.5,
    deg: 53,
    pill: "pink",
    vertical: false,
    delay: 4.06,
    duration: 6.48,
    dx: 11,
    spin: 254,
  },
  { cx: 118.3, cy: -51.1, deg: -36, svg: 2, delay: 2.95, duration: 6.86, dx: 3, spin: 270 },
  {
    cx: 229.1,
    cy: -74.7,
    deg: -90,
    pill: "lime",
    vertical: true,
    delay: 2.78,
    duration: 5.8,
    dx: -6,
    spin: 221,
  },
  { cx: 323.9, cy: -40.9, deg: 10, svg: 3, delay: 5.24, duration: 6.96, dx: 10, spin: -206 },
  {
    cx: 97.7,
    cy: -49.6,
    deg: 53,
    pill: "yellow",
    vertical: false,
    delay: 4.77,
    duration: 6.7,
    dx: 12,
    spin: -184,
  },
  { cx: 184.2, cy: -59.8, deg: 134, svg: 4, delay: 5.44, duration: 6.05, dx: -9, spin: 258 },
  {
    cx: 288.7,
    cy: -69.5,
    deg: 171,
    pill: "orange",
    vertical: true,
    delay: 4.56,
    duration: 5.13,
    dx: -13,
    spin: 327,
  },
  { cx: 77.0, cy: -38.2, deg: 57, svg: 5, delay: 4.59, duration: 7.28, dx: 7, spin: -104 },
  {
    cx: 188.4,
    cy: -60.0,
    deg: 9,
    pill: "blue",
    vertical: false,
    delay: 2.97,
    duration: 5.19,
    dx: 14,
    spin: -204,
  },
  { cx: 279.9, cy: -61.6, deg: 175, svg: 6, delay: 4.07, duration: 7.13, dx: -19, spin: 324 },
  {
    cx: 70.6,
    cy: -54.0,
    deg: -62,
    pill: "pink",
    vertical: true,
    delay: 3.87,
    duration: 7.71,
    dx: -12,
    spin: 220,
  },
  { cx: 188.2, cy: -56.8, deg: -59, svg: 7, delay: 3.52, duration: 5.13, dx: -19, spin: -168 },
  {
    cx: 258.5,
    cy: -76.4,
    deg: -160,
    pill: "lime",
    vertical: false,
    delay: 3.26,
    duration: 6.51,
    dx: -20,
    spin: 270,
  },
  { cx: 47.5, cy: -66.9, deg: -104, svg: 8, delay: 4.1, duration: 7.74, dx: 1, spin: -115 },
  {
    cx: 166.6,
    cy: -39.6,
    deg: -50,
    pill: "yellow",
    vertical: true,
    delay: 2.74,
    duration: 5.83,
    dx: 14,
    spin: -325,
  },
  { cx: 273.0, cy: -37.8, deg: 3, svg: 9, delay: 5.42, duration: 5.05, dx: 1, spin: -239 },
  {
    cx: 29.6,
    cy: -70.5,
    deg: -92,
    pill: "orange",
    vertical: false,
    delay: 3.31,
    duration: 5.36,
    dx: 15,
    spin: -148,
  },
  { cx: 157.2, cy: -49.7, deg: -35, svg: 10, delay: 4.24, duration: 5.14, dx: 0, spin: -125 },
  {
    cx: 227.5,
    cy: -63.4,
    deg: 126,
    pill: "blue",
    vertical: true,
    delay: 4.73,
    duration: 7.32,
    dx: -1,
    spin: -287,
  },
];
