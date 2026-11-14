import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingGiftChangeView from "@/widgets/funding/FundingGiftChangeView";

const meta: Meta<typeof FundingGiftChangeView> = {
  title: "Widgets/Funding/FundingGiftChangeView",
  component: FundingGiftChangeView,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    collectedAmount: 301000,
    currentGift: {
      id: 1,
      productName: "Airpods Max Pro 3",
      price: 329000,
      productImageUrl: "https://picsum.photos/seed/botem-gift-1/400",
    },
    onBack: () => {},
    onSelectCurrentGift: () => {},
    onSelectWish: () => {},
    onBrowseProducts: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FundingGiftChangeView>;

export const WithWishes: Story = {
  args: {
    wishes: [
      {
        id: 2,
        productName: "소니 WH-1000XM5",
        price: 289000,
        productImageUrl: "https://picsum.photos/seed/botem-gift-2/400",
      },
      {
        id: 3,
        productName: "르크루제 머그",
        price: 39000,
        productImageUrl: "https://picsum.photos/seed/botem-gift-3/400",
      },
    ],
  },
};

// 담아둔 위시가 펀딩 중인 1개뿐이라 고를 위시가 없는 경우
export const NoWishes: Story = {
  args: { wishes: [] },
};
