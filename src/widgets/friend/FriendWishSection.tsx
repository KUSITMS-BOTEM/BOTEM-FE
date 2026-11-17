import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import type { FriendWishResponse } from "@/types/friend/friend";
import { formatWon } from "@/utils/funding/giftChangeAmount";
import { isValidUrl } from "@/utils/isValidUrl";
import FriendWishEmptyView from "@/widgets/friend/FriendWishEmptyView";

type FriendWishSectionProps = {
  wishes: FriendWishResponse[];
};

export default function FriendWishSection({ wishes }: FriendWishSectionProps) {
  const isEmpty = wishes.length === 0;

  return (
    <section className="flex w-full flex-col">
      <ListHeader
        title={`위시 ${wishes.length}개`}
        // 서프라이즈 플로우(SUR-PG-004)가 붙기 전까지는 모양만 둔다 (#142에서 범위 제외)
        rightItem={isEmpty ? undefined : { label: "서프라이즈 열기", onClick: () => {} }}
      />
      {isEmpty ? (
        <FriendWishEmptyView />
      ) : (
        <ul className="flex w-full flex-col gap-0.5">
          {wishes.map(wish => (
            <li key={wish.wishId}>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
