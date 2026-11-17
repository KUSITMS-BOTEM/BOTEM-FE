"use client";

import { useEffect, useId, useRef, useState } from "react";

import IconButton from "@/components/IconButton";
import Tooltip from "@/components/Tooltip";
import { cn } from "@/utils/cn";
import IconInfo from "@/assets/icons/icon-info.svg?react";

const SURPRISE_GUIDE = "서프라이즈 펀딩은\n받는 사람이 볼 수 없게 비밀로 진행되는 펀딩이에요";

type FriendSurpriseInfoButtonProps = {
  className?: string;
};

// 탭으로 여닫는다(hover 전용 금지). 바깥을 누르거나 Esc를 누르면 닫힌다
export default function FriendSurpriseInfoButton({ className }: FriendSurpriseInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("size-7", className)}>
      <IconButton
        size="medium"
        icon={<IconInfo />}
        aria-label="서프라이즈 펀딩 안내"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(prev => !prev)}
      />
      {open && (
        // 버튼(28px) 폭에 갇혀 줄바꿈되지 않도록 w-max. 꼬리 끝이 아이콘 중심에 오도록 Figma 좌표에서 역산한 위치
        <div role="tooltip" id={tooltipId} className="absolute top-[32.5px] right-[-1px] w-max">
          <Tooltip direction="up">{SURPRISE_GUIDE}</Tooltip>
        </div>
      )}
    </div>
  );
}
