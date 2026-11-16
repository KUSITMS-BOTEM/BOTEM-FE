import { HERO_EASES } from "@/components/effects/hero-motion/heroMotionData";
import {
  HERO_DURATION,
  toMotion,
  type HeroTrackSet,
} from "@/components/effects/hero-motion/heroMotionTrack";

const track = [
  [0, 0.5, 1],
  [10, 20, 30],
  [1, 2],
] as const;

describe("toMotion", () => {
  it("빈 트랙이면 initial·animate·transition이 모두 빈 객체다", () => {
    expect(toMotion({})).toEqual({ initial: {}, animate: {}, transition: {} });
  });

  it("첫 값은 initial로, 값 배열 전체는 animate로 들어간다", () => {
    const { initial, animate } = toMotion({ x: [[...track[0]], [...track[1]], [...track[2]]] });

    expect(initial).toEqual({ x: 10 });
    expect(animate).toEqual({ x: [10, 20, 30] });
  });

  it("트랙 키가 framer-motion 속성명으로 매핑된다", () => {
    const tracks: HeroTrackSet = {};
    for (const key of ["x", "y", "r", "s", "sx", "sy", "o"] as const) {
      tracks[key] = [[0, 1], [1, 2], [0]];
    }

    expect(Object.keys(toMotion(tracks).animate ?? {})).toEqual([
      "x",
      "y",
      "rotate",
      "scale",
      "scaleX",
      "scaleY",
      "opacity",
    ]);
  });

  it("transition에 duration·times·무한 반복이 들어간다", () => {
    const { transition } = toMotion({
      y: [
        [0, 0.5, 1],
        [1, 2, 3],
        [0, 0],
      ],
    });

    expect(transition?.y).toMatchObject({
      duration: HERO_DURATION,
      times: [0, 0.5, 1],
      repeat: Infinity,
    });
  });

  it("ease가 HERO_EASES 인덱스를 실제 이징 값으로 바꾼 배열이다", () => {
    const { transition } = toMotion({
      y: [
        [0, 0.5, 1],
        [1, 2, 3],
        [1, 2],
      ],
    });

    expect(transition?.y).toMatchObject({ ease: [HERO_EASES[1], HERO_EASES[2]] });
  });

  it("playing=false면 빈 객체를 반환한다", () => {
    expect(toMotion({ x: [[0, 1], [1, 2], [0]] }, false)).toEqual({});
  });

  it("지정한 키만 결과에 포함된다", () => {
    const { animate } = toMotion({ o: [[0, 1], [0, 1], [0]] });

    expect(Object.keys(animate ?? {})).toEqual(["opacity"]);
  });

  it("트랙마다 독립된 transition을 가진다", () => {
    const { transition } = toMotion({
      x: [[0, 1], [1, 2], [0]],
      s: [
        [0, 0.4, 1],
        [1, 2, 3],
        [1, 2],
      ],
    });

    expect(transition?.x).toMatchObject({ times: [0, 1] });
    expect(transition?.scale).toMatchObject({ times: [0, 0.4, 1] });
  });
});
