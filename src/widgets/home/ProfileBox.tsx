import { cn } from "@/utils/cn";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";
import ProfileLime from "@/assets/icons/multicolor/profile-lime.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";
import ProfileBlue from "@/assets/icons/multicolor/profile-blue.svg?react";
import type { ProfileColor } from "@/components/Profile";

const PROFILE_ICON: Record<ProfileColor, typeof ProfileOrange> = {
  orange: ProfileOrange,
  lime: ProfileLime,
  pink: ProfilePink,
  blue: ProfileBlue,
};

const MAX_EXTRA_COUNT = 99;

type ProfileBoxProps = {
  profiles: ProfileColor[];
  extraCount?: number;
  notification?: boolean;
  className?: string;
};

export default function ProfileBox({
  profiles,
  extraCount = 0,
  notification = false,
  className,
}: ProfileBoxProps) {
  return (
    <div
      className={cn(
        "bg-semantic-fill-default/70 relative flex min-w-14.5 items-center justify-center rounded-full p-2 shadow-[0_4px_16px_0_var(--color-semantic-shadow-weak)]",
        className,
      )}>
      <span className="sr-only">참여자 {profiles.length + extraCount}명</span>
      <div className="-mr-1 flex items-center">
        {profiles.map((color, index) => {
          const Icon = PROFILE_ICON[color];
          return (
            <Icon
              key={index}
              aria-hidden
              className={cn("size-6 shrink-0", index < profiles.length - 1 && "-mr-1")}
            />
          );
        })}
      </div>
      {extraCount > 0 && (
        <span
          aria-hidden
          className="bg-semantic-fill-default border-semantic-border-inverted text-semantic-text-secondary relative flex size-6 shrink-0 items-center justify-center rounded-full border [font-family:var(--font-family-a2-z)] text-[9px] leading-[1.252] font-bold tracking-[-0.18px] whitespace-nowrap">
          +{Math.min(extraCount, MAX_EXTRA_COUNT)}
        </span>
      )}
      {notification && (
        <span
          role="img"
          aria-label="새 알림"
          className="absolute -top-1 right-0 flex size-4 items-center justify-center">
          <span className="bg-base-orange-500 size-[5.333px] rounded-full" />
        </span>
      )}
    </div>
  );
}
