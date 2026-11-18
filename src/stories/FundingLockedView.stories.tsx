import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FundingLockedView from "@/widgets/funding/FundingLockedView";

const meta = {
  title: "Widgets/Funding/FundingLockedView",
  component: FundingLockedView,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    revealDateLabel: "10월 13일 0시",
  },
} satisfies Meta<typeof FundingLockedView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
