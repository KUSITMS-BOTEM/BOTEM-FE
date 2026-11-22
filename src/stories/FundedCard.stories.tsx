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
    relationship: { control: "inline-radio", options: ["OPENED", "RECEIVED", "PARTICIPATED"] },
    fundingType: { control: "inline-radio", options: ["BIRTHDAY", "SURPRISE"] },
    celebrantName: { control: "text" },
    rollingPaperCount: { control: "number" },
    href: { control: "text" },
  },
  args: {
    productName: "에어팟 프로 2",
    productImageUrl: "",
    relationship: "OPENED",
    fundingType: "BIRTHDAY",
    celebrantName: "서준",
    rollingPaperCount: 8,
  },
} satisfies Meta<typeof FundedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenedBirthday: Story = {
  args: { href: "/funding/1" },
};

export const OpenedSurpriseBeforeReveal: Story = {
  args: {
    fundingType: "SURPRISE",
    celebrantName: "지유",
    rollingPaperCount: null,
    href: "/funding/2",
  },
};

export const Received: Story = {
  args: { relationship: "RECEIVED", fundingType: "SURPRISE" },
};

export const Participated: Story = {
  args: { relationship: "PARTICIPATED", celebrantName: "도윤" },
};

export const LongProductName: Story = {
  args: {
    productName: "아주 긴 상품명이 들어가서 한 줄을 넘어가면 말줄임 처리가 되는지 확인하는 상품",
    href: "/funding/1",
  },
};
