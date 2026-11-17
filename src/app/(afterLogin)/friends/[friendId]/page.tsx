import FriendProfileContainer from "@/widgets/friend/FriendProfileContainer";

type FriendProfilePageProps = {
  params: Promise<{ friendId: string }>;
};

export default async function FriendProfilePage({ params }: FriendProfilePageProps) {
  const { friendId } = await params;

  return <FriendProfileContainer friendId={friendId} />;
}
