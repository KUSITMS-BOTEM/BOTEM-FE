import WishSearchIllustration from "@/components/effects/WishSearchIllustration";

export default function FriendWishEmptyView() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-5">
      <WishSearchIllustration />
      <p className="text-semantic-text-quaternary text-center [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-label-small)]">
        {"아직 위시가 없어요\n위시 담겼을 때 다시 알려드릴게요"}
      </p>
    </div>
  );
}
