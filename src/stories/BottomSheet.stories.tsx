import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import BottomSheet from "@/components/BottomSheet";

const meta: Meta<typeof BottomSheet> = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

function BottomSheetDemo({ height }: { height: "auto" | "max" }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>바텀시트 열기</Button>
      <BottomSheet
        open={open}
        title="타이틀 최대 한줄"
        height={height}
        leftButtonLabel="버튼"
        rightButtonLabel="버튼"
        onLeftButtonClick={() => setOpen(false)}
        onRightButtonClick={() => setOpen(false)}
        onClose={() => setOpen(false)}>
        {height === "max" ? (
          Array.from({ length: 20 }, (_, index) => (
            <p key={index} className="text-semantic-text-secondary w-full py-2">
              내용 {index + 1}
            </p>
          ))
        ) : (
          <p className="text-semantic-text-secondary">내용 영역</p>
        )}
      </BottomSheet>
    </>
  );
}

export const Auto: Story = {
  render: () => <BottomSheetDemo height="auto" />,
};

export const Max: Story = {
  render: () => <BottomSheetDemo height="max" />,
};
