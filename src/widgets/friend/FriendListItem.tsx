import Badge from "@/components/Badge";
import Profile from "@/components/Profile";

type FriendListItemProps = {
  name: string;
  wishCount: number;
  imageUrl?: string;
  birthdayText?: string;
  dDayText?: string;
  badge?: { label: string; color: "neutral" | "brand" };
};

export default function FriendListItem({
  name,
  wishCount,
  imageUrl,
  birthdayText,
  dDayText,
  badge,
}: FriendListItemProps) {
  return (
    <div className="flex w-full items-center gap-3 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Profile imageUrl={imageUrl} showIconButton={false} className="size-9 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]">
          <p className="text-semantic-text-primary truncate [font:var(--semantic-label-large)]">
            {name} · 위시 {wishCount}개
          </p>
          {birthdayText && (
            <p className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-large)]">
              {birthdayText}
            </p>
          )}
          {dDayText && (
            <p className="text-semantic-text-tertiary truncate [font:var(--semantic-subtext-small)]">
              {dDayText}
            </p>
          )}
        </div>
      </div>
      {badge && <Badge {...badge} variant="weak" />}
    </div>
  );
}
