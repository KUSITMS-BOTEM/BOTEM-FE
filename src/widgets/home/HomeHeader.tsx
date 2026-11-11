import SegmentControl, { type SegmentValue } from "@/widgets/home/SegmentControl";

type HomeHeaderProps = {
  onSegmentChange: (value: SegmentValue) => void;
};

export default function HomeHeader({ onSegmentChange }: HomeHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-5 py-3">
      <SegmentControl onChange={onSegmentChange} />
    </header>
  );
}
