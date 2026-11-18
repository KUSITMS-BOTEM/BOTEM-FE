import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingResultView, { type FundingResult } from "@/widgets/funding/FundingResultView";
import SampleCat from "@/assets/images/samples/cat.jpg";

const meta: Meta<typeof FundingResultView> = {
  title: "Widgets/Funding/FundingResultView",
  component: FundingResultView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, height: "800px" } },
  },
  args: {
    reduceMotion: false,
    onClose: () => {},
    onBuy: () => {},
    onChangeGift: () => {},
    onExtend: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FundingResultView>;

// 프로필 사진이 없는 친구는 userId에 따라 기본 프로필 색(orange·pink·lime·blue)이 정해진다
const makeContributors = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ userId: index + 1 }));

const achieved = (contributorCount: number): FundingResult => ({
  goalAchieved: true,
  collectedAmount: 123456678,
  productName: "소니 WH-1000XM5",
  productImage: SampleCat,
  productPrice: 364000,
  giftChanged: false,
  canExtend: true,
  contributors: makeContributors(contributorCount),
});

const missed = (contributorCount: number): FundingResult => ({
  ...achieved(contributorCount),
  goalAchieved: false,
  collectedAmount: 236000,
});

/** 목표 달성(FUND-PG-011). 친구 5명이 날아와 사진을 5조각으로 채운다 */
export const GoalAchieved: Story = { args: { result: achieved(5) } };

/** 친구 1명: 동그라미 하나가 들어가면 사진 전체가 한 번에 컬러로 바뀐다 */
export const OneFriend: Story = { args: { result: achieved(1) } };

/** 친구 2명: 사진이 1/2씩 채워진다 */
export const TwoFriends: Story = { args: { result: achieved(2) } };

/** 친구 3명: 사진이 1/3씩 채워진다 */
export const ThreeFriends: Story = { args: { result: achieved(3) } };

/** 친구 8명: Figma 원본과 같은 1/8 조각 */
export const EightFriends: Story = { args: { result: achieved(8) } };

/** 친구 12명: 8명이 넘어도 앞의 8명만 날아와 1/8씩 채운다 */
export const OverEightFriends: Story = { args: { result: achieved(12) } };

/** 목표 미달(FUND-PG-012): 차액 안내 · 기간연장 · 다른 선물 고르기 · 차액으로 구매 */
export const GoalMissed: Story = { args: { result: missed(5) } };

/** 미달 화면에서 다른 선물로 바꾼 뒤 돌아온 상태 */
export const GiftChanged: Story = { args: { result: { ...missed(5), giftChanged: true } } };

/** 기간 연장을 이미 한 번 써서 기간연장 버튼이 없는 상태 */
export const ExtendUsed: Story = { args: { result: { ...missed(5), canExtend: false } } };

/** 모션 감소 설정: 친구·컨페티 없이 완성된 컬러 사진만 보여준다 */
export const ReducedMotion: Story = { args: { result: achieved(5), reduceMotion: true } };
