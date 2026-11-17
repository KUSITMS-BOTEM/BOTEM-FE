import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Tooltip from "@/components/Tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    children: { control: "text" },
  },
  args: {
    children: "나도 지유님께 보태볼까요?",
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortText: Story = {
  args: { children: "보태기" },
};
