import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import NumberFieldGroup from "@/components/NumberFieldGroup";

const meta: Meta<typeof NumberFieldGroup> = {
  title: "Components/NumberFieldGroup",
  component: NumberFieldGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
  },
  decorators: [
    Story => (
      <div className="w-[373px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NumberFieldGroup>;

function NumberFieldGroupDemo({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return <NumberFieldGroup label="비밀번호 4자리" value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => <NumberFieldGroupDemo />,
};

export const PartiallyFilled: Story = {
  render: () => <NumberFieldGroupDemo initialValue="12" />,
};

export const Filled: Story = {
  render: () => <NumberFieldGroupDemo initialValue="1234" />,
};
