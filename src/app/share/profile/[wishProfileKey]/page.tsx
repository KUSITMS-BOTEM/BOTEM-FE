import { cookies } from "next/headers";

import GuestFriendProfileContainer from "@/widgets/friend/GuestFriendProfileContainer";

type GuestFriendProfilePageProps = {
  params: Promise<{ wishProfileKey: string }>;
};

export default async function GuestFriendProfilePage({ params }: GuestFriendProfilePageProps) {
  const { wishProfileKey } = await params;
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";

  return <GuestFriendProfileContainer wishProfileKey={wishProfileKey} isLoggedIn={isLoggedIn} />;
}
