import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import RadioBox from "@/components/RadioBox";

const meta = {
  title: "Components/RadioBox",
  component: RadioBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "라디오박스 레이블",
  },
} satisfies Meta<typeof RadioBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    "aria-label": "선택",
  },
};

const OPTIONS = ["1만원", "3만원", "5만원"];

function GroupDemo() {
  const [value, setValue] = useState(OPTIONS[0]);
  return (
    <div role="radiogroup" aria-label="금액 선택" className="flex flex-col gap-4">
      {OPTIONS.map(option => (
        <RadioBox
          key={option}
          name="amount"
          value={option}
          label={option}
          checked={value === option}
          onChange={() => setValue(option)}
        />
      ))}
    </div>
  );
}

export const Group: Story = {
  render: () => <GroupDemo />,
};
