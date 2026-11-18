// TODO(API): 친구 목록 응답에 아직 없는 필드다. BE가 추가하면 이름·값을 맞추고 optional을 뗀다
export type FriendFundingStatus = "NONE" | "FUNDING" | "SURPRISE_FUNDING";

export type FriendResponse = {
  userId: number;
  name: string;
  profileImageUrl: string | null;
  birthday: string | null;
  birthdayDday: number | null;
  wishCount: number;
  fundingStatus?: FriendFundingStatus;
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
