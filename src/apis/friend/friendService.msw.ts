import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";
import { toMockShareKey } from "@/mocks/mockShareKey";
import type {
  FriendFundingResponse,
  FriendProfileResponse,
  FriendResponse,
  FriendWishDetailResponse,
} from "@/types/friend/friend";
import { addDays } from "@/utils/funding/addDays";
import { getTodayDate } from "@/utils/funding/formatDeadline";

const upcoming: FriendResponse[] = [
  {
    userId: 2,
    name: "민지",
    profileImageUrl: null,
    birthday: "11-16",
    birthdayDday: 3,
    wishCount: 3,
    fundingInProgress: true,
    surpriseFundingInProgress: false,
  },
  {
    userId: 3,
    name: "서준",
    profileImageUrl: null,
    birthday: "11-20",
    birthdayDday: 7,
    wishCount: 6,
    fundingInProgress: false,
    surpriseFundingInProgress: true,
  },
  {
    userId: 4,
    name: "정민",
    profileImageUrl: null,
    birthday: "12-03",
    birthdayDday: 20,
    wishCount: 0,
    fundingInProgress: false,
    surpriseFundingInProgress: false,
  },
  {
    userId: 5,
    name: "지우",
    profileImageUrl: null,
    birthday: "12-07",
    birthdayDday: 24,
    wishCount: 6,
    fundingInProgress: false,
    surpriseFundingInProgress: false,
  },
];
const others: FriendResponse[] = [
  {
    userId: 6,
    name: "하린",
    profileImageUrl: null,
    birthday: "03-28",
    birthdayDday: 135,
    wishCount: 4,
    fundingInProgress: false,
    surpriseFundingInProgress: false,
  },
  {
    userId: 7,
    name: "예준",
    profileImageUrl: null,
    birthday: null,
    birthdayDday: null,
    wishCount: 0,
    fundingInProgress: false,
    surpriseFundingInProgress: false,
  },
];

const createFundings = (count: number): FriendFundingResponse[] =>
  Array.from({ length: count }, (_, index) => {
    const product = MOCK_RECOMMENDED_PRODUCTS[index % MOCK_RECOMMENDED_PRODUCTS.length];
    return {
      fundingId: 100 + index,
      shareKey: toMockShareKey(100 + index),
      type: index === 0 ? "SURPRISE" : "BIRTHDAY",
      productName: product.name,
      productImageUrl: product.imageUrl,
      deadline: `${addDays(getTodayDate(), 7 + index)}T23:59:59.999999`,
      remainingDays: 7 + index,
      participantCount: 7,
      firstParticipantName: "민지",
      confirmedPercentage: 55,
    };
  });

const createWishes = (count: number): FriendWishDetailResponse[] =>
  MOCK_RECOMMENDED_PRODUCTS.slice(0, count).map(product => ({
    wishId: 200 + product.id,
    productName: product.name,
    productImageUrl: product.imageUrl,
    price: product.price,
    sellerName: product.sellerName,
    productUrl: "https://link.coupang.com/a/example",
    activeSurpriseFundingId: null,
  }));

// 친구 프로필 4가지 분기(펀딩 O/X × 위시 O/X)를 친구별로 확인할 수 있게 배정한다. 목록에 없는 친구는 404
const PROFILE_CASES: Record<number, { fundingCount: number; wishCount: number }> = {
  2: { fundingCount: 5, wishCount: 2 },
  3: { fundingCount: 1, wishCount: 0 },
  4: { fundingCount: 0, wishCount: 2 },
  5: { fundingCount: 0, wishCount: 0 },
  6: { fundingCount: 1, wishCount: 2 },
  7: { fundingCount: 0, wishCount: 0 },
};

const findFriendCase = (userId: number) => {
  const friend = [...upcoming, ...others].find(item => item.userId === userId);
  const profileCase = PROFILE_CASES[userId];
  return friend && profileCase ? { friend, profileCase } : null;
};

const createProfile = (userId: number, wishesVisible: boolean): FriendProfileResponse | null => {
  const found = findFriendCase(userId);
  if (!found) return null;
  const { friend, profileCase } = found;
  return {
    userId: friend.userId,
    name: friend.name,
    profileImageUrl: friend.profileImageUrl,
    birthday: friend.birthday,
    birthdayDday: friend.birthdayDday,
    fundings: createFundings(profileCase.fundingCount),
    wishesVisible,
    wishCount: profileCase.wishCount,
    wishes: wishesVisible
      ? createWishes(profileCase.wishCount).map(
          ({ wishId, productName, productImageUrl, price }) => ({
            wishId,
            productName,
            productImageUrl,
            price,
          }),
        )
      : [],
  };
};

const notFound = (code: string, message: string) =>
  HttpResponse.json({ success: false, data: null, error: { code, message } }, { status: 404 });

export const friendHandlers = [
  http.get("*/api/friends", async () => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: {
        totalCount: upcoming.length + others.length,
        upcomingBirthdayFriends: upcoming,
        friends: [...others, ...upcoming].sort((a, b) => a.name.localeCompare(b.name, "ko")),
      },
      error: null,
    });
  }),
  http.post("*/api/friends", async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  http.delete("*/api/friends/:friendId", async ({ params }) => {
    await delay(300);
    if (!findFriendCase(Number(params.friendId))) {
      return notFound("FRIEND_002", "친구 관계가 아닙니다.");
    }
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
  http.get("*/api/friends/:friendId/profile", async ({ params }) => {
    await delay(500);
    const profile = createProfile(Number(params.friendId), true);
    if (!profile) return notFound("FRIEND_002", "친구 관계가 아닙니다.");
    return HttpResponse.json({ success: true, data: profile, error: null });
  }),
  http.get("*/api/friends/:friendId/wishes/:wishId", async ({ params }) => {
    await delay(500);
    const found = findFriendCase(Number(params.friendId));
    const wish = found
      ? createWishes(found.profileCase.wishCount).find(
          item => item.wishId === Number(params.wishId),
        )
      : undefined;
    if (!wish) return notFound("FRIEND_002", "친구 관계가 아닙니다.");
    return HttpResponse.json({ success: true, data: wish, error: null });
  }),
  // 위시 프로필 키 대신 목업 친구 userId를 키로 쓴다. 비로그인 조회처럼 위시는 개수만 내려준다
  http.get("*/api/wish-profiles/:wishProfileKey", async ({ params }) => {
    await delay(500);
    const profile = createProfile(Number(params.wishProfileKey), false);
    if (!profile) return notFound("FRIEND_003", "위시 프로필을 찾을 수 없습니다.");
    return HttpResponse.json({ success: true, data: profile, error: null });
  }),
];
