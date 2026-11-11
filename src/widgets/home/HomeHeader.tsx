import IconButton from "@/components/IconButton";
import SegmentControl, { type SegmentValue } from "@/widgets/home/SegmentControl";
import IconMenu from "@/assets/icons/icon-menu.svg?react";

type HomeHeaderProps = {
  onSegmentChange: (value: SegmentValue) => void;
  onMenuClick: () => void;
};

export default function HomeHeader({ onSegmentChange, onMenuClick }: HomeHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-5 py-3">
      <SegmentControl onChange={onSegmentChange} />
      <IconButton
        size="large"
        variant="stroke"
        icon={<IconMenu />}
        aria-label="메뉴 열기"
        onClick={onMenuClick}
      />
    </header>
  );
}
