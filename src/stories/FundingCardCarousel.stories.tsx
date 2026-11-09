import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingCardCarousel, { type FundingCardData } from "@/widgets/main/FundingCardCarousel";
import SampleProduct from "@/assets/images/samples/sample-product.png";

const baseCard: Omit<FundingCardData, "id"> = {
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
};

const meta = {
  title: "Widgets/Main/FundingCardCarousel",
  component: FundingCardCarousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower overflow-hidden px-32 py-12">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    cards: { control: false },
    className: { control: false },
  },
  args: {
    animateOnMount: true,
    cards: [
      { ...baseCard, id: 1 },
      { ...baseCard, id: 2, progress: 70 },
      { ...baseCard, id: 3, progress: 100 },
    ],
  },
} satisfies Meta<typeof FundingCardCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Carousel: Story = {};

export const FiveCards: Story = {
  args: {
    cards: [1, 2, 3, 4, 5].map(id => ({ ...baseCard, id, progress: id * 20 })),
  },
};

export const SingleCard: Story = {
  args: {
    cards: [{ ...baseCard, id: 1 }],
  },
};
