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

export type FriendFundingResponse = {
  fundingId: number;
  isSurprise: boolean;
  title: string;
  productName: string;
  productImageUrl: string | null;
  /** "YYYY-MM-DD" */
  deadline: string;
  currentAmount: number;
  targetAmount: number;
  representativeParticipantName: string | null;
  participantCount: number;
};

export type FriendWishResponse = {
  wishId: number;
  productName: string;
  productImageUrl: string | null;
  price: number;
  sellerName: string;
  productUrl: string;
};

export type FriendProfileResponse = {
  userId: number;
  name: string;
  profileImageUrl: string | null;
  birthday: string | null;
  birthdayDday: number | null;
  fundings: FriendFundingResponse[];
  wishes: FriendWishResponse[];
};
