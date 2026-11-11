import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";

const meta: Meta<typeof CloseSheet> = {
  title: "Components/CloseSheet",
  component: CloseSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof CloseSheet>;

function CloseSheetDemo() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>시트 열기</Button>
      <CloseSheet open={open} title="타이틀 최대 한줄" onClose={() => setOpen(false)}>
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index} className="text-semantic-text-secondary w-full py-2">
            내용 {index + 1}
          </p>
        ))}
      </CloseSheet>
    </>
  );
}

export const Default: Story = {
  render: () => <CloseSheetDemo />,
};
