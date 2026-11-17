import {
  BUTTON,
  BUTTON_SHINE,
  CARD_BURST,
  CARD_IDLE,
  CARD_PRESS,
  EXPIRED_BUTTON,
  EXPIRED_CARD,
  EXPIRED_EXIT_FADE,
  EXPIRED_GLOW,
  EXPIRED_SWEEP,
  FLASH,
  GLOW,
  HOLO_BAND,
  RIPPLES,
  SPARKLES,
  WHITEOUT_FADE,
  type MotionPreset,
} from "@/widgets/home/fundingCardFxMotion";

const presets: [string, MotionPreset][] = [
  ["CARD_IDLE", CARD_IDLE],
  ["CARD_PRESS", CARD_PRESS],
  ["CARD_BURST", CARD_BURST],
  ...Object.entries(GLOW).map(([phase, preset]): [string, MotionPreset] => [
    `GLOW.${phase}`,
    preset,
  ]),
  ...Object.entries(BUTTON).map(([phase, preset]): [string, MotionPreset] => [
    `BUTTON.${phase}`,
    preset,
  ]),
  ["FLASH", FLASH],
  ["WHITEOUT_FADE", WHITEOUT_FADE],
  ["HOLO_BAND", HOLO_BAND],
  ["BUTTON_SHINE", BUTTON_SHINE],
  ...RIPPLES.map((preset, i): [string, MotionPreset] => [`RIPPLES[${i}]`, preset]),
  ...SPARKLES.map(({ preset }, i): [string, MotionPreset] => [`SPARKLES[${i}]`, preset]),
  ...Object.entries(EXPIRED_CARD).map(([phase, preset]): [string, MotionPreset] => [
    `EXPIRED_CARD.${phase}`,
    preset,
  ]),
  ...Object.entries(EXPIRED_BUTTON).map(([phase, preset]): [string, MotionPreset] => [
    `EXPIRED_BUTTON.${phase}`,
    preset,
  ]),
  ["EXPIRED_GLOW", EXPIRED_GLOW],
  ["EXPIRED_SWEEP", EXPIRED_SWEEP],
  ["EXPIRED_EXIT_FADE", EXPIRED_EXIT_FADE],
];

const timesOf = (preset: MotionPreset, property: string) =>
  (preset.transition[property] as { times: number[] }).times;

describe("fundingCardFxMotion 프리셋", () => {
  describe.each(presets)("%s", (_name, preset) => {
    it("animate의 각 속성 keyframe 개수가 transition times 길이와 같다", () => {
      Object.entries(preset.animate).forEach(([property, keyframes]) => {
        expect(keyframes, property).toHaveLength(timesOf(preset, property).length);
      });
    });

    it("모든 times가 0으로 시작해 1로 끝나고 감소하지 않는다", () => {
      Object.keys(preset.animate).forEach(property => {
        const times = timesOf(preset, property);

        expect(times[0], property).toBe(0);
        expect(times[times.length - 1], property).toBe(1);
        times.slice(1).forEach((time, i) => {
          expect(time, `${property}[${i + 1}]`).toBeGreaterThanOrEqual(times[i]);
        });
      });
    });
  });
});

describe("CARD_BURST 회전 떨림", () => {
  const rotate = CARD_BURST.animate.rotate;
  const tremble = rotate.slice(2, -2);

  it("처음 두 값과 마지막 두 값은 0이다", () => {
    expect(rotate.slice(0, 2)).toEqual([0, 0]);
    expect(rotate.slice(-2)).toEqual([0, 0]);
  });

  it("떨림 값은 부호가 번갈아 바뀐다", () => {
    tremble.slice(1).forEach((value, i) => {
      expect(Math.sign(value)).toBe(-Math.sign(tremble[i]));
    });
  });

  it("떨림 진폭은 0.5에서 시작해 3.6으로 끝난다", () => {
    expect(Math.abs(tremble[0])).toBeCloseTo(0.5);
    expect(Math.abs(tremble[tremble.length - 1])).toBeCloseTo(3.6);
  });

  it("떨림 진폭은 단조 증가한다", () => {
    const amplitudes = tremble.map(Math.abs);

    amplitudes.slice(1).forEach((amplitude, i) => {
      expect(amplitude).toBeGreaterThan(amplitudes[i]);
    });
  });
});
