import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "360px" } },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

function AlertDemo({ confirmColor }: { confirmColor: "brand" | "danger" }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>다이얼로그 열기</Button>
      <Dialog
        open={open}
        kind="alert"
        title="타이틀"
        description="추가설명"
        confirmColor={confirmColor}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

function ConfirmDemo({ direction }: { direction: "horizontal" | "vertical" }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>다이얼로그 열기</Button>
      <Dialog
        open={open}
        kind="confirm"
        title="타이틀"
        description="추가설명"
        direction={direction}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const AlertBrand: Story = {
  render: () => <AlertDemo confirmColor="brand" />,
};

export const AlertDanger: Story = {
  render: () => <AlertDemo confirmColor="danger" />,
};

export const ConfirmHorizontal: Story = {
  render: () => <ConfirmDemo direction="horizontal" />,
};

export const ConfirmVertical: Story = {
  render: () => <ConfirmDemo direction="vertical" />,
};
