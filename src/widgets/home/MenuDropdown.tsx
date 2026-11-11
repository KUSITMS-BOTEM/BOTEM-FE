import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";

export type MenuDropdownItem = {
  icon: ReactNode;
  label: string;
  href?: string;
};

type MenuDropdownProps = {
  items: MenuDropdownItem[];
  onSelect?: (item: MenuDropdownItem, index: number) => void;
  className?: string;
};

export default function MenuDropdown({ items, onSelect, className }: MenuDropdownProps) {
  return (
    <div
      className={cn(
        "bg-semantic-fill-default/70 rounded-x-large flex w-fit min-w-[154px] flex-col items-start gap-1 px-4 py-3 shadow-[0px_4px_32px_0px_var(--color-semantic-shadow-default)] backdrop-blur-[15px]",
        className,
      )}>
      {items.map((item, index) => {
        const content = (
          <>
            <Asset icon={item.icon} size="medium" className="text-semantic-icon-default" />
            <span className="text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-medium)]">
              {item.label}
            </span>
          </>
        );
        const rowClassName =
          "flex w-full cursor-pointer items-center gap-2 py-2 transition-transform active:scale-95";
        const handleSelect = () => onSelect?.(item, index);

        return item.href ? (
          <Link key={index} href={item.href} onClick={handleSelect} className={rowClassName}>
            {content}
          </Link>
        ) : (
          <button key={index} type="button" onClick={handleSelect} className={rowClassName}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
