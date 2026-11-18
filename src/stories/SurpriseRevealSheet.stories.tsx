import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SurpriseRevealSheet from "@/widgets/funding/SurpriseRevealSheet";

const meta = {
  title: "Widgets/Funding/SurpriseRevealSheet",
  component: SurpriseRevealSheet,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    open: true,
    recipientName: "지유",
    contributorNames: ["지민", "서연", "도윤", "하은", "민준", "수아", "예준", "지우"],
    totalAmount: 429000,
    onClose: () => {},
  },
} satisfies Meta<typeof SurpriseRevealSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwelveContributors: Story = {
  args: {
    contributorNames: [
      "지민",
      "서연",
      "도윤",
      "하은",
      "민준",
      "수아",
      "예준",
      "지우",
      "현서",
      "시우",
      "유나",
      "주원",
    ],
    totalAmount: 612000,
  },
};
