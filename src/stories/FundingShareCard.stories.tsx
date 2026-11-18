import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingShareCard from "@/widgets/funding/FundingShareCard";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import { addDays } from "@/utils/funding/addDays";
import { getTodayDate } from "@/utils/funding/formatDeadline";

const meta = {
  title: "Widgets/Funding/FundingShareCard",
  component: FundingShareCard,
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
    productImageUrl: { control: false },
    className: { control: false },
  },
  args: {
    openerName: "민지",
    title: "지유의\n생일 펀딩",
    productImageUrl: SampleProduct.src,
    productName: "소니 WH-1000XM5",
    targetAmount: 123456789,
    deadline: addDays(getTodayDate(), 7),
  },
} satisfies Meta<typeof FundingShareCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {};

export const Large: Story = { args: { size: "large" } };

export const MediumWithProgress: Story = { args: { progress: 40 } };

export const MediumAlmostThere: Story = { args: { progress: 80 } };

export const LargeWithProgress: Story = { args: { size: "large", progress: 40 } };

export const LargeAlmostThere: Story = { args: { size: "large", progress: 80 } };

// 서프라이즈 개설 완료 화면에서 쓰는 모습
export const WithoutBadge: Story = { args: { showBadge: false } };

export const WithoutImage: Story = { args: { productImageUrl: undefined } };
