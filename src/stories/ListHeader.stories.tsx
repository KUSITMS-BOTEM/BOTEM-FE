import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ListHeader from "@/components/ListHeader";

const RIGHT_ITEM = { label: "추가하기", onClick: () => {} };

const meta = {
  title: "Components/ListHeader",
  component: ListHeader,
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
    title: { control: "text" },
    as: { control: "inline-radio", options: ["h2", "h3", "h4"] },
    bg: { control: "boolean" },
    rightItem: { control: false },
  },
  args: {
    title: "타이틀",
  },
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRightItem: Story = {
  args: { rightItem: RIGHT_ITEM },
};

export const Bg: Story = {
  args: { bg: true },
};

export const BgWithRightItem: Story = {
  args: { bg: true, rightItem: RIGHT_ITEM },
};

export const LongTitle: Story = {
  args: {
    title: "아주 긴 타이틀이 들어가서 한 줄을 넘어가면 말줄임 처리가 됩니다",
    bg: true,
    rightItem: RIGHT_ITEM,
  },
};
