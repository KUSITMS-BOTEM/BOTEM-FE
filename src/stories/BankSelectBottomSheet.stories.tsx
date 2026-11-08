import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import BankSelectBottomSheet from "@/widgets/payout-account/BankSelectBottomSheet";
import type { BankCode } from "@/constants/bank";

const meta: Meta<typeof BankSelectBottomSheet> = {
  title: "Widgets/PayoutAccount/BankSelectBottomSheet",
  component: BankSelectBottomSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof BankSelectBottomSheet>;

function BankSelectBottomSheetDemo({
  initialSelectedBank,
}: {
  initialSelectedBank: BankCode | null;
}) {
  const [open, setOpen] = useState(true);
  const [selectedBank, setSelectedBank] = useState<BankCode | null>(initialSelectedBank);

  return (
    <>
      <Button onClick={() => setOpen(true)}>은행 선택하기</Button>
      <BankSelectBottomSheet
        open={open}
        selectedBank={selectedBank}
        onSelectBank={code => {
          setSelectedBank(code);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <BankSelectBottomSheetDemo initialSelectedBank={null} />,
};

export const WithSelection: Story = {
  render: () => <BankSelectBottomSheetDemo initialSelectedBank="KAKAO_BANK" />,
};
