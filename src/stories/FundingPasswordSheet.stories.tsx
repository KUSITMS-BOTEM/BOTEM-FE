import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import FundingPasswordSheet from "@/widgets/funding/FundingPasswordSheet";

const meta: Meta<typeof FundingPasswordSheet> = {
  title: "Widgets/Funding/FundingPasswordSheet",
  component: FundingPasswordSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof FundingPasswordSheet>;

function FundingPasswordSheetDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>비밀번호 입력</Button>
      <FundingPasswordSheet
        open={open}
        hostName="지유"
        onClose={() => setOpen(false)}
        onPrev={() => setOpen(false)}
        onComplete={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <FundingPasswordSheetDemo />,
};
