import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CoupangMoveGuide from "@/widgets/main/CoupangMoveGuide";

const meta = {
  title: "Widgets/Main/CoupangMoveGuide",
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
