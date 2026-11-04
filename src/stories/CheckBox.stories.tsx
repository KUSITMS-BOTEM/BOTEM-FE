import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import CheckBox from "@/components/CheckBox";

const meta = {
  title: "Components/CheckBox",
  component: CheckBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "체크박스 레이블",
  },
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CheckBox aria-label="미선택" />
      <CheckBox aria-label="선택" defaultChecked />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CheckBox label="비활성" disabled />
      <CheckBox label="비활성 (선택됨)" disabled defaultChecked />
    </div>
  ),
};

function ControlledDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <CheckBox
        label="약관에 동의합니다"
        checked={checked}
        onChange={e => setChecked(e.target.checked)}
      />
      <p className="text-semantic-text-tertiary">checked: {String(checked)}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
