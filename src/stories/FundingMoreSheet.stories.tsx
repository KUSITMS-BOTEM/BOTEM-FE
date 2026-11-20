import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import FundingMoreSheet from "@/widgets/funding/FundingMoreSheet";

const meta: Meta<typeof FundingMoreSheet> = {
  title: "Widgets/Funding/FundingMoreSheet",
  component: FundingMoreSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof FundingMoreSheet>;

function FundingMoreSheetDemo({ extended }: { extended: boolean }) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>더보기 열기</Button>
      <FundingMoreSheet
        open={open}
        extended={extended}
        onClose={close}
        onReissueShareCardClick={close}
        onCloseEarlyClick={close}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <FundingMoreSheetDemo extended={false} />,
};

export const Extended: Story = {
  render: () => <FundingMoreSheetDemo extended />,
};
