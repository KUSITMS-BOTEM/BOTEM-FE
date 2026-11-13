export type FriendResponse = {
  userId: number;
  name: string;
  profileImageUrl: string | null;
  birthday: string | null;
  birthdayDday: number | null;
  wishCount: number;
};

export type FriendListResponse = {
  totalCount: number;
  upcomingBirthdayFriends: FriendResponse[];
  friends: FriendResponse[];
};
