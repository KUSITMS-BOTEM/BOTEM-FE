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
    participants: { control: "check", options: ["orange", "lime", "pink"] },
    productImageUrl: { control: false },
    className: { control: false },
  },
  args: {
    type: "default",
    title: "{닉네임}님의 생일 펀딩",
    productName: "{상품명}",
    productImageUrl: SampleProduct.src,
    progress: 40,
    dDay: 7,
    targetAmount: 999999999,
    participants: ["orange", "lime", "pink"],
    extraParticipantCount: 99,
    pendingCount: 2,
    isSurprise: true,
  },
} satisfies Meta<typeof FundingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Notification: Story = {
  args: { type: "notification", progress: 100 },
};

export const Open: Story = {
  args: { type: "open", progress: 100 },
};

export const WithoutParticipantsAndBadge: Story = {
  args: { participants: [], pendingCount: 0, isSurprise: false },
};
