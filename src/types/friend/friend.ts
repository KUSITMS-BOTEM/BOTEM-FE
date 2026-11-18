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

// 비로그인 공개 프로필은 위시 내용을 숨기고 개수만 받는다 (TODO(API): BE 스펙 확정 후 필드 맞추기)
export type GuestFriendProfileResponse = Omit<FriendProfileResponse, "wishes"> & {
  wishCount: number;
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
