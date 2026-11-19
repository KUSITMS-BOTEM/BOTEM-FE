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

export type FriendFundingType = "BIRTHDAY" | "SURPRISE";

export type FriendFundingResponse = {
  fundingId: number;
  type: FriendFundingType;
  productName: string;
  productImageUrl: string | null;
  /** "YYYY-MM-DDTHH:mm:ss.SSSSSS" */
  deadline: string;
  remainingDays: number;
  participantCount: number;
  firstParticipantName: string | null;
  /** 확정 금액 기준 달성률(소수점 버림) */
  confirmedPercentage: number;
};

export type FriendWishResponse = {
  wishId: number;
  productName: string;
  productImageUrl: string | null;
  price: number;
};

export type FriendWishDetailResponse = FriendWishResponse & {
  productUrl: string;
  sellerName: string;
  /** 친구가 받는 사람인 진행 중 서프라이즈 ID. 없으면 null */
  activeSurpriseFundingId: number | null;
};

// 비로그인 공개 프로필은 위시 내용을 숨기고 개수만 받는다 (TODO(API): BE 스펙 확정 후 필드 맞추기)
export type GuestFriendProfileResponse = Omit<FriendProfileResponse, "wishes" | "wishesVisible"> & {
  wishCount: number;
};

export type FriendProfileResponse = {
  userId: number;
  name: string;
  profileImageUrl: string | null;
  birthday: string | null;
  birthdayDday: number | null;
  fundings: FriendFundingResponse[];
  wishesVisible: boolean;
  wishCount: number;
  wishes: FriendWishResponse[];
};
