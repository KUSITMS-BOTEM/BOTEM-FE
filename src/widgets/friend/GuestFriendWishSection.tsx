import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import FriendWishEmptyView from "@/widgets/friend/FriendWishEmptyView";

type GuestFriendWishSectionProps = {
  wishCount: number;
};

export default function GuestFriendWishSection({ wishCount }: GuestFriendWishSectionProps) {
  return (
    <section className="flex w-full flex-col">
      <ListHeader title={`위시 ${wishCount}개`} />
      {wishCount === 0 ? (
        <FriendWishEmptyView />
      ) : (
        <ul className="flex w-full flex-col gap-0.5">
          {/* 비로그인에는 위시 내용이 내려오지 않아 id 없는 자리표시 항목뿐이다 */}
          {Array.from({ length: wishCount }, (_, index) => (
            <li key={index}>
              <List type="product" thumbnailLocked title="로그인하면 볼 수 있어요" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
