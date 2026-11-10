import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CoupangMoveGuide from "@/components/CoupangMoveGuide";

const meta = {
  title: "Components/CoupangMoveGuide",
  component: CoupangMoveGuide,
  parameters: {
    layout: "centered",
  },
  decorators: [
    Story => (
      <div className="w-[340px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof CoupangMoveGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
