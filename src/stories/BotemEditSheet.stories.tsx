import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";

const meta: Meta<typeof BotemEditSheet> = {
  title: "Widgets/Funding/BotemEditSheet",
  component: BotemEditSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof BotemEditSheet>;

function BotemEditSheetDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>내 보탬 찾기</Button>
      <BotemEditSheet open={open} onClose={() => setOpen(false)} onSubmit={() => setOpen(false)} />
    </>
  );
}

export const Default: Story = {
  render: () => <BotemEditSheetDemo />,
};
