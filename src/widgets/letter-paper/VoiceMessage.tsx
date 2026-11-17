import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { LETTER_ACCENT_BG_CLASS, type Color } from "@/constants/color";
import IconRecord from "@/assets/icons/multicolor/ico-record.svg?react";
import WaveformBars from "@/widgets/letter-paper/WaveformBars";

type VoiceMessageProps = {
  color?: Color;
  // 있으면 버튼을 눌러 재생/정지할 수 있다
  audio?: Blob;
  className?: string;
};

export default function VoiceMessage({ color = "pink", audio, className }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const urlRef = useRef<string | null>(null);

  const stop = () => {
    playerRef.current?.pause();
    playerRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setIsPlaying(false);
  };

  // 언마운트·녹음 교체 시 재생을 끊고 object URL을 해제한다
  useEffect(() => stop, [audio]);

  const toggle = () => {
    if (!audio) return;
    if (playerRef.current) return stop();
    const url = URL.createObjectURL(audio);
    const player = new Audio(url);
    const release = () => {
      if (playerRef.current === player) stop();
    };
    player.onended = release;
    player.onerror = release;
    playerRef.current = player;
    urlRef.current = url;
    setIsPlaying(true);
    player.play().catch(release);
  };

  const buttonClass = cn(
    "flex size-8 shrink-0 flex-col items-start rounded-full pt-[5px] pl-[5px] transition-colors duration-300",
    isPlaying ? LETTER_ACCENT_BG_CLASS[color] : "bg-semantic-fill-neutral",
  );

  return (
    <div
      role={audio ? "group" : "img"}
      aria-label="음성 메시지"
      className={cn(
        "bg-semantic-fill-default flex h-10 w-[91px] items-center gap-2.5 rounded-full px-2 py-1 shadow-[0_4px_16px_var(--color-semantic-shadow-weak)] backdrop-blur-[3.57px]",
        className,
      )}>
      {audio ? (
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
