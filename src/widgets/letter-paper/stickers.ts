import type { FunctionComponent, SVGProps } from "react";

import StickerIcon from "@/assets/icons/multicolor/tool-sheet-sticker.svg?react";

export type Sticker = {
  id: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
};

// 디자인팀이 스티커 목록을 주기 전까지 같은 아이콘 20개로 레이아웃만 채운다
export const STICKERS: Sticker[] = Array.from({ length: 20 }, (_, index) => ({
  id: `sticker-${index + 1}`,
  Icon: StickerIcon,
}));
