import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";
import type {
  FriendFundingResponse,
  FriendResponse,
  FriendWishResponse,
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
    fundingStatus: "FUNDING",
  },
  {
    userId: 3,
    name: "서준",
    profileImageUrl: null,
    birthday: "11-20",
    birthdayDday: 7,
    wishCount: 6,
    fundingStatus: "SURPRISE_FUNDING",
  },
  {
    userId: 4,
    name: "정민",
    profileImageUrl: null,
    birthday: "12-03",
    birthdayDday: 20,
    wishCount: 0,
  },
  {
    userId: 5,
    name: "지우",
    profileImageUrl: null,
    birthday: "12-07",
    birthdayDday: 24,
    wishCount: 6,
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
  },
  {
    userId: 7,
    name: "예준",
    profileImageUrl: null,
    birthday: null,
    birthdayDday: null,
    wishCount: 0,
  },
];

const createFundings = (name: string, count: number): FriendFundingResponse[] =>
  Array.from({ length: count }, (_, index) => {
    const product = MOCK_RECOMMENDED_PRODUCTS[index % MOCK_RECOMMENDED_PRODUCTS.length];
    return {
      fundingId: 100 + index,
      isSurprise: index === 0,
      title: `${name}의 생일 펀딩`,
      productName: product.name,
      productImageUrl: product.imageUrl,
      deadline: addDays(getTodayDate(), 7 + index),
      currentAmount: Math.floor(product.price * 0.55),
      targetAmount: product.price,
      representativeParticipantName: "민지",
      participantCount: 7,
    };
  });

const createWishes = (count: number): FriendWishResponse[] =>
  MOCK_RECOMMENDED_PRODUCTS.slice(0, count).map(product => ({
    wishId: 200 + product.id,
    productName: product.name,
    productImageUrl: product.imageUrl,
    price: product.price,
    sellerName: product.sellerName,
    productUrl: "https://link.coupang.com/a/example",
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
  http.get("*/api/friends/:friendId", async ({ params }) => {
    await delay(500);
    const friendId = Number(params.friendId);
    const friend = [...upcoming, ...others].find(item => item.userId === friendId);
    const profileCase = PROFILE_CASES[friendId];
    if (!friend || !profileCase) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FRIEND_NOT_FOUND", message: "친구를 찾을 수 없습니다." },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId: friend.userId,
        name: friend.name,
        profileImageUrl: friend.profileImageUrl,
        birthday: friend.birthday,
        birthdayDday: friend.birthdayDday,
        fundings: createFundings(friend.name, profileCase.fundingCount),
        wishes: createWishes(profileCase.wishCount),
      },
      error: null,
    });
  }),
  // 비로그인 공개 프로필 — 친구 프로필과 같은 케이스 배정을 쓰고 위시는 개수만 내려준다
  http.get("*/api/friends/:userId/public", async ({ params }) => {
    await delay(500);
    const userId = Number(params.userId);
    const friend = [...upcoming, ...others].find(item => item.userId === userId);
    const profileCase = PROFILE_CASES[userId];
    if (!friend || !profileCase) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다." },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        userId: friend.userId,
        name: friend.name,
        profileImageUrl: friend.profileImageUrl,
        birthday: friend.birthday,
        birthdayDday: friend.birthdayDday,
        fundings: createFundings(friend.name, profileCase.fundingCount),
        wishCount: profileCase.wishCount,
      },
      error: null,
    });
  }),
];
