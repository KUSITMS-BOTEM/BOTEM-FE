"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import Satets from "@/components/Satets";
import MenuDropdown, { type MenuDropdownItem } from "@/widgets/main/MenuDropdown";
import IconPlus from "@/assets/icons/icon-plus.svg?react";

type FloatingButtonProps = {
  items: MenuDropdownItem[];
  onSelect?: (item: MenuDropdownItem, index: number) => void;
  className?: string;
};

export default function FloatingButton({ items, onSelect, className }: FloatingButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item: MenuDropdownItem, index: number) => {
    onSelect?.(item, index);
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="dim"
            aria-hidden
            className="bg-semantic-background-dim fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-10 flex items-center justify-end px-5 pb-5",
          className,
        )}>
        <button
          type="button"
          aria-label={open ? "추가 메뉴 닫기" : "추가 메뉴 열기"}
          onClick={() => setOpen(prev => !prev)}
          className={cn(
            "group pointer-events-auto relative flex size-12 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95",
            open ? "bg-semantic-fill-neutral-weak" : "bg-semantic-fill-neutral",
          )}>
          <Satets color={open ? "black" : "white"} className="rounded-full" />
          <Asset
            icon={<IconPlus />}
            size="small"
            className={cn(
              "relative z-10 transition-transform",
              open ? "text-semantic-icon-default rotate-45" : "text-semantic-icon-on-fill",
            )}
          />
        </button>
        {open && (
          <MenuDropdown
            items={items}
            onSelect={handleSelect}
            className="pointer-events-auto absolute right-5 bottom-full mb-3"
          />
        )}
      </div>
    </>
  );
}
