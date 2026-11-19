import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

type GuestFriendProfilePageProps = {
  params: Promise<{ wishProfileKey: string }>;
};

export default async function GuestFriendProfilePage({ params }: GuestFriendProfilePageProps) {
  const { wishProfileKey } = await params;

  return <GuestFriendProfileContainer wishProfileKey={wishProfileKey} />;
}
