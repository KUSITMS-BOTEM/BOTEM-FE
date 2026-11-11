import Asset from "@/components/Asset";
import ListText from "@/components/ListText";
import Profile from "@/components/Profile";
import IconRight from "@/assets/icons/icon-right.svg?react";

type MyMenuProfileRowProps = {
  nickname: string;
  birthdayText?: string;
  profileImageUrl?: string;
  onClick: () => void;
};

export default function MyMenuProfileRow({
  nickname,
  birthdayText,
  profileImageUrl,
  onClick,
}: MyMenuProfileRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-4 text-left">
      <Profile imageUrl={profileImageUrl} showIconButton={false} className="size-9 shrink-0" />
      <span className="flex min-w-0 flex-1 items-center gap-3 py-3">
        <ListText title={nickname} description={birthdayText} className="flex-1" />
        <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />
      </span>
    </button>
  );
}
