import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import { addDays } from "@/utils/funding/addDays";
import { getTodayDate } from "@/utils/funding/formatDeadline";

const meta = {
  title: "Widgets/Funding/FundingProgressCard",
  component: FundingProgressCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-12">
        {/* 카드는 부모 가로를 채우므로 폭을 줘야 한다. 폭을 바꿔 보면 비율 확대를 확인할 수 있다 */}
        <div className="w-80">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    productImageUrl: { control: false },
    className: { control: false },
  },
  args: {
    fundingId: 4,
    productImageUrl: SampleProduct.src,
    productName: "소니 WH-1000XM5",
    deadline: addDays(getTodayDate(), 7),
    percent: 60,
    targetAmount: 123456789,
  },
} satisfies Meta<typeof FundingProgressCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// fundingId를 해시해 색이 정해지므로 아래 id는 각각 그 색으로 고정된다
export const Orange: Story = {};

export const Pink: Story = { args: { fundingId: 1 } };

export const Lime: Story = { args: { fundingId: 2 } };

export const Blue: Story = { args: { fundingId: 3 } };

export const Disabled: Story = { args: { percent: 0 } };

export const AlmostDone: Story = { args: { percent: 97 } };

// 마감 상태: 기간이 지나면 D-0 + "기간 마감", 기간이 남아도 목표를 채우면 D-n 유지 + "마감"
export const PeriodClosed: Story = { args: { deadline: addDays(getTodayDate(), -1) } };

export const AmountClosed: Story = { args: { percent: 100 } };
