import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";

type MockHomeScenario =
  | "FUNDING"
  | "IN_PROGRESS"
  | "SINGLE_FUNDING"
  | "CLOSED_PENDING"
  | "CLOSED_OPEN"
  | "WISH_ONLY"
  | "EMPTY";

// 홈 분기(마감·진행 중 / 진행 중만 / 1개 / 마감+확인대기 / 마감+확인대기 없음 / 위시만 / 빈 홈)를 눈으로 확인할 때 이 값만 바꾼다
const MOCK_HOME_SCENARIO = "CLOSED_OPEN" as MockHomeScenario;

const [product1, product2, product3, product4] = MOCK_RECOMMENDED_PRODUCTS;

const MOCK_FUNDING_CARDS = [
  {
    fundingId: 12,
    cardType: "CLOSED_UNOPENED",
    fundingType: "BIRTHDAY",
    productName: product1.name,
    productImageUrl: product1.imageUrl,
    remainingDays: null,
    confirmedPercentage: 80,
    pendingPercentage: 20,
    pendingContributionCount: 2,
    targetAmount: product1.price,
    participantCount: 6,
  },
  {
    fundingId: 13,
    cardType: "CLOSED_UNOPENED",
    fundingType: "BIRTHDAY",
    productName: product2.name,
    productImageUrl: product2.imageUrl,
    remainingDays: null,
    confirmedPercentage: 100,
    pendingPercentage: 0,
    pendingContributionCount: 0,
    targetAmount: product2.price,
    participantCount: 3,
  },
  {
    fundingId: 15,
    cardType: "IN_PROGRESS",
    fundingType: "SURPRISE",
    productName: product3.name,
    productImageUrl: product3.imageUrl,
    remainingDays: 7,
    confirmedPercentage: 35,
    pendingPercentage: 15,
    pendingContributionCount: 2,
    targetAmount: product3.price,
    participantCount: 17,
  },
  {
    fundingId: 16,
    cardType: "IN_PROGRESS",
    fundingType: "BIRTHDAY",
    productName: product4.name,
    productImageUrl: product4.imageUrl,
    remainingDays: 21,
    confirmedPercentage: 10,
    pendingPercentage: 0,
    pendingContributionCount: 0,
    targetAmount: product4.price,
    participantCount: 1,
  },
];

const MOCK_HOME_WISHES = MOCK_RECOMMENDED_PRODUCTS.slice(0, 3).map(product => ({
  wishId: product.id,
  productName: product.name,
  productImageUrl: product.imageUrl,
  price: product.price,
  productUrl: "https://link.coupang.com/a/example",
}));

export const homeHandlers = [
  http.get("*/api/home/fundings", async () => {
    await delay(800);
    const fundingCards = {
      FUNDING: MOCK_FUNDING_CARDS,
      IN_PROGRESS: MOCK_FUNDING_CARDS.filter(card => card.cardType === "IN_PROGRESS"),
      SINGLE_FUNDING: MOCK_FUNDING_CARDS.filter(card => card.cardType === "IN_PROGRESS").slice(
        0,
        1,
      ),
      CLOSED_PENDING: MOCK_FUNDING_CARDS.filter(
        card =>
          card.cardType === "CLOSED_UNOPENED" &&
          card.pendingContributionCount > 0 &&
          card.participantCount >= 1,
      ),
      CLOSED_OPEN: MOCK_FUNDING_CARDS.filter(
        card =>
          card.cardType === "CLOSED_UNOPENED" &&
          card.pendingContributionCount === 0 &&
          card.participantCount >= 1,
      ),
      WISH_ONLY: [],
      EMPTY: [],
    }[MOCK_HOME_SCENARIO];
    const activeFundingCount = fundingCards.filter(card => card.cardType === "IN_PROGRESS").length;

    return HttpResponse.json({
      success: true,
      data: { fundingCards, activeFundingCount, canOpenFunding: activeFundingCount < 3 },
      error: null,
    });
  }),
  http.get("*/api/home/no-funding", async () => {
    await delay(800);
    if (MOCK_HOME_SCENARIO !== "WISH_ONLY" && MOCK_HOME_SCENARIO !== "EMPTY") {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "HOME_001", message: "홈에 표시할 펀딩이 존재합니다." },
        },
        { status: 409 },
      );
    }

    const content = MOCK_HOME_SCENARIO === "WISH_ONLY" ? MOCK_HOME_WISHES : [];
    return HttpResponse.json({
      success: true,
      data: {
        state: content.length > 0 ? "WISH_RECOMMENDATION" : "EMPTY",
        nickname: "지유",
        birthdayDday: 23,
        wishes: { content, page: 0, size: 10, totalElements: content.length, hasNext: false },
      },
      error: null,
    });
  }),
];
