import { useEffect, useRef, useState } from "react";

// Blob은 object URL로, 문자열은 그 주소 그대로 재생한다. source가 바뀌거나 언마운트되면 재생을 끊는다
export function useAudioPlayback(source?: Blob | string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stop = () => {
    playerRef.current?.pause();
    playerRef.current = null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setIsPlaying(false);
  };

  useEffect(() => stop, [source]);

  const toggle = () => {
    if (!source) return;
    if (playerRef.current) return stop();
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    if (typeof source !== "string") objectUrlRef.current = url;
    const player = new Audio(url);
    const release = () => {
      if (playerRef.current === player) stop();
    };
    player.onended = release;
    player.onerror = release;
    playerRef.current = player;
    setIsPlaying(true);
    player.play().catch(release);
  };

  return { isPlaying, toggle };
}
