import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";
import { getMockContributionProgress } from "@/mocks/mockContributions";
import { getMockGiftVerificationTargets } from "@/mocks/mockGiftVerifications";

type MockHomeScenario =
  | "FUNDING"
  | "IN_PROGRESS"
  | "SINGLE_FUNDING"
  | "CLOSED_PENDING"
  | "CLOSED_OPEN"
  | "CLOSED_EMPTY"
  | "EARLY_COMPLETE"
  | "WISH_ONLY"
  | "EMPTY";

// 홈 분기(마감·진행 중 / 진행 중만 / 1개 / 마감+확인 대기 / 마감+확인 대기 없음 / 마감+참여자 0명 / 마감 전 100% 달성 / 위시만 / 빈 홈)를 눈으로 확인할 때 이 값만 바꾼다
const MOCK_HOME_SCENARIO = "IN_PROGRESS" as MockHomeScenario;

const [product1, product2, product3, product4] = MOCK_RECOMMENDED_PRODUCTS;

// 프로필 이미지가 있는 회원과 없는 회원·비회원(null)이 섞이도록 둔다
const MOCK_PARTICIPANT_PREVIEWS = [
  {
    participantName: "민지",
    profileImageUrl: faker.image.urlPicsumPhotos({ width: 48, height: 48, blur: 0 }),
  },
  { participantName: "서준", profileImageUrl: null },
  {
    participantName: "하린",
    profileImageUrl: faker.image.urlPicsumPhotos({ width: 48, height: 48, blur: 0 }),
  },
];

const MOCK_FUNDING_CARDS = [
  {
    fundingId: 12,
    cardType: "CLOSED_UNOPENED",
    fundingType: "BIRTHDAY",
    productName: product1.name,
    productImageUrl: product1.imageUrl,
    targetAmount: product1.price,
    participantCount: 5,
    participantPreviews: MOCK_PARTICIPANT_PREVIEWS,
    remainingDays: null,
    confirmedPercentage: 80,
    pendingPercentage: 20,
    pendingContributionCount: 0,
  },
  {
    fundingId: 13,
    cardType: "CLOSED_UNOPENED",
    fundingType: "BIRTHDAY",
    productName: product2.name,
    productImageUrl: product2.imageUrl,
    targetAmount: product2.price,
    participantCount: 4,
    participantPreviews: MOCK_PARTICIPANT_PREVIEWS,
    remainingDays: null,
    confirmedPercentage: 100,
    pendingPercentage: 0,
    pendingContributionCount: 0,
  },
  {
    fundingId: 14,
    cardType: "CLOSED_UNOPENED",
    fundingType: "BIRTHDAY",
    productName: product1.name,
    productImageUrl: product1.imageUrl,
    targetAmount: product1.price,
    participantCount: 0,
    participantPreviews: [],
    remainingDays: null,
    confirmedPercentage: 0,
    pendingPercentage: 0,
    pendingContributionCount: 0,
  },
  {
    fundingId: 15,
    cardType: "IN_PROGRESS",
    fundingType: "SURPRISE",
    productName: product3.name,
    productImageUrl: product3.imageUrl,
    targetAmount: product3.price,
    participantCount: 2,
    participantPreviews: MOCK_PARTICIPANT_PREVIEWS.slice(0, 2),
    remainingDays: 7,
    confirmedPercentage: 35,
    pendingPercentage: 15,
    pendingContributionCount: 2,
  },
  {
    fundingId: 16,
    cardType: "IN_PROGRESS",
    fundingType: "BIRTHDAY",
    productName: product4.name,
    productImageUrl: product4.imageUrl,
    targetAmount: product4.price,
    participantCount: 1,
    participantPreviews: MOCK_PARTICIPANT_PREVIEWS.slice(1, 2),
    remainingDays: 21,
    confirmedPercentage: 10,
    pendingPercentage: 0,
    pendingContributionCount: 0,
  },
  {
    fundingId: 17,
    cardType: "IN_PROGRESS",
    fundingType: "BIRTHDAY",
    productName: product2.name,
    productImageUrl: product2.imageUrl,
    targetAmount: product2.price,
    participantCount: 4,
    participantPreviews: MOCK_PARTICIPANT_PREVIEWS,
    remainingDays: 5,
    confirmedPercentage: 100,
    pendingPercentage: 0,
    pendingContributionCount: 0,
  },
];

const MOCK_HOME_WISHES = MOCK_RECOMMENDED_PRODUCTS.slice(0, 3).map(product => ({
  wishId: product.id,
  productName: product.name,
  productImageUrl: product.imageUrl,
  price: product.price,
  productUrl: "https://link.coupang.com/a/example",
}));

export const createHomeHandlers = (scenario: MockHomeScenario) => [
  http.get("*/api/home/fundings", async () => {
    await delay(800);
    const scenarioCards = {
      FUNDING: MOCK_FUNDING_CARDS,
      IN_PROGRESS: MOCK_FUNDING_CARDS.filter(card => card.cardType === "IN_PROGRESS"),
      SINGLE_FUNDING: MOCK_FUNDING_CARDS.filter(card => card.cardType === "IN_PROGRESS").slice(
        0,
        1,
      ),
      CLOSED_PENDING: MOCK_FUNDING_CARDS.filter(
        card => card.cardType === "CLOSED_UNOPENED" && card.pendingContributionCount > 0,
      ),
      CLOSED_OPEN: MOCK_FUNDING_CARDS.filter(
        card =>
          card.cardType === "CLOSED_UNOPENED" &&
          card.pendingContributionCount === 0 &&
          card.confirmedPercentage > 0,
      ),
      CLOSED_EMPTY: MOCK_FUNDING_CARDS.filter(
        card => card.cardType === "CLOSED_UNOPENED" && card.confirmedPercentage === 0,
      ),
      EARLY_COMPLETE: MOCK_FUNDING_CARDS.filter(
        card => card.cardType === "IN_PROGRESS" && card.confirmedPercentage >= 100,
      ),
      WISH_ONLY: [],
      EMPTY: [],
    }[scenario];
    const fundingCards = scenarioCards.map(card => {
      const progress = getMockContributionProgress(card.fundingId);
      return {
        ...card,
        confirmedPercentage: card.confirmedPercentage + progress.confirmedAddedPercentage,
        pendingPercentage: progress.pendingPercentage,
        pendingContributionCount: progress.pendingContributionCount,
      };
    });
    const activeFundingCount = fundingCards.filter(card => card.cardType === "IN_PROGRESS").length;

    return HttpResponse.json({
      success: true,
      data: { fundingCards, activeFundingCount, canOpenFunding: activeFundingCount < 3 },
      error: null,
    });
  }),
  http.get("*/api/home/no-funding", async () => {
    await delay(800);
    if (scenario !== "WISH_ONLY" && scenario !== "EMPTY") {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "HOME_001", message: "홈에 표시할 펀딩이 존재합니다." },
        },
        { status: 409 },
      );
    }

    const content = scenario === "WISH_ONLY" ? MOCK_HOME_WISHES : [];
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
  http.get("*/api/home/gift-verifications/banner", async () => {
    await delay(300);
    const pendingCount = getMockGiftVerificationTargets().length;
    return HttpResponse.json({
      success: true,
      data: { visible: pendingCount > 0, pendingCount },
      error: null,
    });
  }),
  http.get("*/api/home/gift-verifications", async () => {
    await delay(500);
    const targets = getMockGiftVerificationTargets();
    return HttpResponse.json({
      success: true,
      data: { pendingCount: targets.length, targets },
      error: null,
    });
  }),
];

export const homeHandlers = createHomeHandlers(MOCK_HOME_SCENARIO);
