import { cn } from "@/utils/cn";

const BAR_HEIGHTS = ["h-2", "h-3.5", "h-[22px]", "h-[18px]", "h-2"];
// 막대마다 시작 지연을 달리해 물결처럼 어긋나게 움직인다
const BAR_DELAYS_MS = [0, 150, 300, 100, 250];

type WaveformBarsProps = {
  // true면 막대 길이가 반복해서 늘었다 줄어든다
  active?: boolean;
  // 막대 색 클래스
  barClassName: string;
  className?: string;
};

export default function WaveformBars({
  active = false,
  barClassName,
  className,
}: WaveformBarsProps) {
  return (
    <div aria-hidden className={cn("flex h-[22px] shrink-0 items-center gap-0.5", className)}>
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={index}
          style={active ? { animationDelay: `${BAR_DELAYS_MS[index]}ms` } : undefined}
          className={cn(
            "w-[5px] rounded-[48px] transition-colors duration-300",
            height,
            active && "animate-[waveform-bar_0.9s_ease-in-out_infinite]",
            barClassName,
          )}
        />
      ))}
    </div>
  );
}
