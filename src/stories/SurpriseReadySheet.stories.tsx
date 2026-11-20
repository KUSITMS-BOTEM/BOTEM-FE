import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SampleProduct from "@/assets/images/samples/sample-product.png";
import SurpriseReadySheet from "@/widgets/funding/SurpriseReadySheet";

const meta = {
  title: "Widgets/Funding/SurpriseReadySheet",
  component: SurpriseReadySheet,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    shareKey: "share-key-1",
    recipientName: "지유",
    revealDateLabel: "10월 13일 0시",
    contributorCount: 7,
    progress: 92,
    productImageUrl: SampleProduct.src,
    productName: "소니 WH-1000XM5",
    startDate: "2026-10-31",
    endDate: "2026-11-15",
    onClose: () => {},
  },
} satisfies Meta<typeof SurpriseReadySheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
