import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import FundingExtendSheet from "@/widgets/funding/FundingExtendSheet";

const meta: Meta<typeof FundingExtendSheet> = {
  title: "Widgets/Funding/FundingExtendSheet",
  component: FundingExtendSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof FundingExtendSheet>;

function FundingExtendSheetDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>마감일 연장</Button>
      <FundingExtendSheet
        open={open}
        collectedAmount={301000}
        currentDeadline="2026-10-13"
        onExtend={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <FundingExtendSheetDemo />,
};
