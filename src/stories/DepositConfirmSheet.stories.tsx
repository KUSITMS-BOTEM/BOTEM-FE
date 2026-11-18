import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import type { DepositItem } from "@/utils/funding/depositConfirm";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";

const meta: Meta<typeof DepositConfirmSheet> = {
  title: "Widgets/Funding/DepositConfirmSheet",
  component: DepositConfirmSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "700px" } },
  },
};

export default meta;
type Story = StoryObj<typeof DepositConfirmSheet>;

const DEPOSITS: DepositItem[] = [
  { id: 1, senderName: "김하린이", amount: 45000, depositedAt: "2026-11-18T11:20:00" },
  { id: 2, senderName: "김하린이", amount: 45000, depositedAt: "2026-11-16T11:20:00" },
  { id: 3, senderName: "김하린이", amount: 45000, depositedAt: "2026-11-16T09:10:00" },
  { id: 4, senderName: "박도윤", amount: 30000, depositedAt: "2026-11-14T21:45:00" },
];

function DepositConfirmSheetDemo({ deposits }: { deposits: DepositItem[] }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>입금 확인 열기</Button>
      <DepositConfirmSheet open={open} deposits={deposits} onClose={() => setOpen(false)} />
    </>
  );
}

export const Default: Story = {
  render: () => <DepositConfirmSheetDemo deposits={DEPOSITS} />,
};

export const Empty: Story = {
  render: () => <DepositConfirmSheetDemo deposits={[]} />,
};
