import Link from "next/link";

import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import type { FriendWishResponse } from "@/types/friend/friend";
import { formatWon } from "@/utils/funding/giftChangeAmount";
import { isValidUrl } from "@/utils/isValidUrl";
import FriendWishEmptyView from "@/widgets/friend/FriendWishEmptyView";

type FriendWishSectionProps = {
  friendId: string;
  wishes: FriendWishResponse[];
  onSurpriseOpen: () => void;
};

export default function FriendWishSection({
  friendId,
  wishes,
  onSurpriseOpen,
}: FriendWishSectionProps) {
  const isEmpty = wishes.length === 0;

  return (
    <section className="flex w-full flex-col">
      <ListHeader
        title={`위시 ${wishes.length}개`}
        rightItem={isEmpty ? undefined : { label: "서프라이즈 열기", onClick: onSurpriseOpen }}
      />
      {isEmpty ? (
        <FriendWishEmptyView />
      ) : (
        <ul className="flex w-full flex-col gap-0.5">
          {wishes.map(wish => (
            <li key={wish.wishId}>
              <Link href={`/friends/${friendId}/wish/${wish.wishId}`} className="block">
                <List
                  type="product"
                  textType="price"
                  titleUp
                  title={formatWon(wish.price)}
                  description={wish.productName}
                  thumbnailSrc={
                    wish.productImageUrl && isValidUrl(wish.productImageUrl)
                      ? wish.productImageUrl
                      : undefined
                  }
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
