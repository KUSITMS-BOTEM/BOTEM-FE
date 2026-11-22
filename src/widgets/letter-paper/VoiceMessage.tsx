import { cn } from "@/utils/cn";
import { LETTER_ACCENT_BG_CLASS, type Color } from "@/constants/color";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import IconRecord from "@/assets/icons/multicolor/ico-record.svg?react";
import WaveformBars from "@/widgets/letter-paper/WaveformBars";

type VoiceMessageProps = {
  color?: Color;
  // 방금 녹음한 음성. 있으면 버튼을 눌러 재생/정지할 수 있다
  audio?: Blob;
  // 서버에 저장된 음성 주소. audio가 없을 때 쓴다
  audioUrl?: string;
  className?: string;
};

export default function VoiceMessage({
  color = "pink",
  audio,
  audioUrl,
  className,
}: VoiceMessageProps) {
  const source = audio ?? audioUrl;
  const { isPlaying, toggle } = useAudioPlayback(source);

  const buttonClass = cn(
    "flex size-8 shrink-0 flex-col items-start rounded-full pt-[5px] pl-[5px] transition-colors duration-300",
    isPlaying ? LETTER_ACCENT_BG_CLASS[color] : "bg-semantic-fill-neutral",
  );

  return (
    <div
      role={source ? "group" : "img"}
      aria-label="음성 메시지"
      className={cn(
        "bg-semantic-fill-default flex h-10 w-[91px] items-center gap-2.5 rounded-full px-2 py-1 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] backdrop-blur-[3.57px]",
        className,
      )}>
      {source ? (
        <button
          type="button"
          aria-label={isPlaying ? "음성 메시지 정지" : "음성 메시지 재생"}
          onClick={toggle}
          className={cn(buttonClass, "cursor-pointer")}>
          <IconRecord aria-hidden />
        </button>
      ) : (
        <div className={buttonClass}>
          <IconRecord aria-hidden />
        </div>
      )}
      <WaveformBars
        active={isPlaying}
        barClassName={isPlaying ? "bg-black" : LETTER_ACCENT_BG_CLASS[color]}
      />
    </div>
  );
}
