import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

type GuestFriendProfilePageProps = {
  params: Promise<{ userId: string }>;
};

export default async function GuestFriendProfilePage({ params }: GuestFriendProfilePageProps) {
  const { userId } = await params;

  return <GuestFriendProfileContainer userId={userId} />;
}
