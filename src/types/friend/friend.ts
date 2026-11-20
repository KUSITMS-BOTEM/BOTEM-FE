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

// 친구 프로필(GET /friends/{id}/profile)과 위시 프로필(GET /wish-profiles/{key})이 같은 형식을 쓴다
export type FriendProfileResponse = {
  userId: number;
  name: string;
  profileImageUrl: string | null;
  birthday: string | null;
  birthdayDday: number | null;
  fundings: FriendFundingResponse[];
  // 비로그인·친구 아닌 방문자는 false이고 wishes는 빈 배열이다
  wishesVisible: boolean;
  wishCount: number;
  wishes: FriendWishResponse[];
};

export type AddFriendRequest = {
  // 위시 프로필 주소 /@{wishProfileKey}의 값
  wishProfileKey: string;
};
