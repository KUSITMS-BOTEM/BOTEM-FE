import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingCard from "@/widgets/home/FundingCard";
import SampleProduct from "@/assets/images/samples/sample-product.png";

const meta = {
  title: "Widgets/Main/FundingCard",
  component: FundingCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-12">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: { control: "inline-radio", options: ["default", "notification", "open"] },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    participants: { control: "object" },
    productImageUrl: { control: false },
    className: { control: false },
  },
  args: {
    type: "default",
    title: "{닉네임}님의 펀딩",
    productName: "{상품명}",
    productImageUrl: SampleProduct.src,
    progress: 40,
    dDay: 7,
    targetAmount: 999999999,
    participants: [{ color: "orange" }, { color: "lime" }, { color: "pink" }],
    extraParticipantCount: 99,
    pendingCount: 2,
    isSurprise: true,
  },
} satisfies Meta<typeof FundingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 마감 카드는 남은 일수가 없어(dDay null) '마감'으로 표시된다
export const Notification: Story = {
  args: { type: "notification", progress: 100, dDay: null },
};

export const Open: Story = {
  args: { type: "open", progress: 100, dDay: null },
};

// 마감 전이라 남은 일수가 그대로 보인다
export const EarlyComplete: Story = {
  args: { type: "earlyComplete", progress: 100, dDay: 5 },
};

export const WithoutParticipantsAndBadge: Story = {
  args: { participants: [], pendingCount: 0, isSurprise: false },
};
