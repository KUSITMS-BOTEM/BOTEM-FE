import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundedCard from "@/widgets/funding/FundedCard";

const meta = {
  title: "Widgets/FundedCard",
  component: FundedCard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    productName: { control: "text" },
    productImageUrl: { control: "text" },
    fundingType: { control: "inline-radio", options: ["BIRTHDAY", "SURPRISE"] },
    goalAchieved: { control: "boolean" },
    participantCount: { control: "number" },
    proofStatus: { control: "inline-radio", options: [undefined, "NEED", "DONE"] },
    recipientName: { control: "text" },
  },
  args: {
    productName: "에어팟 프로 2",
    productImageUrl: "",
    fundingType: "BIRTHDAY",
    goalAchieved: true,
    participantCount: 8,
  },
} satisfies Meta<typeof FundedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BirthdayProofNeeded: Story = {
  args: { proofStatus: "NEED" },
};

export const BirthdayProofDone: Story = {
  args: { proofStatus: "DONE" },
};

export const BirthdayWithoutProof: Story = {};

export const Surprise: Story = {
  args: {
    fundingType: "SURPRISE",
    goalAchieved: false,
    participantCount: 6,
    recipientName: "서준",
  },
};

export const LongProductName: Story = {
  args: {
    productName: "아주 긴 상품명이 들어가서 한 줄을 넘어가면 말줄임 처리가 되는지 확인하는 상품",
    proofStatus: "NEED",
  },
};
