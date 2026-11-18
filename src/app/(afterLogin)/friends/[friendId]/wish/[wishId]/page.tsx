import FriendWishDetailContainer from "@/widgets/friend/FriendWishDetailContainer";

type FriendWishDetailPageProps = {
  params: Promise<{ friendId: string; wishId: string }>;
};

export default async function FriendWishDetailPage({ params }: FriendWishDetailPageProps) {
  const { friendId, wishId } = await params;

  return <FriendWishDetailContainer friendId={friendId} wishId={wishId} />;
}
