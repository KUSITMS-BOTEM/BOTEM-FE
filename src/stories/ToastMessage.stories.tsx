import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import ToastMessage from "@/components/ToastMessage";
import IconInfo from "@/assets/icons/icon-info.svg?react";

const TOAST_TEXT = "토스트 메세지가 들어가요 최대 2줄까지만 가능";

const meta: Meta<typeof ToastMessage> = {
  title: "Components/ToastMessage",
  component: ToastMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "200px" } },
  },
};

export default meta;
type Story = StoryObj<typeof ToastMessage>;

function DefaultDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setShow(prev => !prev)}>토스트 토글</Button>
      <ToastMessage show={show} text={TOAST_TEXT} />
    </div>
  );
}

function SuccessDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setShow(prev => !prev)}>토스트 토글</Button>
      <ToastMessage show={show} state text={TOAST_TEXT} />
    </div>
  );
}

function DangerDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setShow(prev => !prev)}>토스트 토글</Button>
      <ToastMessage show={show} state={false} text={TOAST_TEXT} />
    </div>
  );
}

function WithCustomIconDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setShow(prev => !prev)}>토스트 토글</Button>
      <ToastMessage show={show} text={TOAST_TEXT} withIcon={<IconInfo aria-hidden />} />
    </div>
  );
}

function WithButtonDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setShow(prev => !prev)}>토스트 토글</Button>
      <ToastMessage
        show={show}
        state={false}
        text={TOAST_TEXT}
        showButton
        buttonText="붙여넣기"
        onButtonClick={() => setShow(false)}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

export const Success: Story = {
  render: () => <SuccessDemo />,
};

export const Danger: Story = {
  render: () => <DangerDemo />,
};

export const WithCustomIcon: Story = {
  render: () => <WithCustomIconDemo />,
};

export const WithButton: Story = {
  render: () => <WithButtonDemo />,
};
