import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextArea from "@/components/TextArea";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="w-[373px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    error: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
  },
  args: {
    label: "레이블",
    placeholder: "플레이스홀더",
    helperText: "Help Text",
    maxLength: 50,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Typed: Story = {
  args: {
    defaultValue: "입력값",
  },
};

export const ErrorState: Story = {
  args: {
    error: true,
    defaultValue: "입력값",
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const LongText: Story = {
  args: {
    maxLength: 300,
    defaultValue:
      "내용이 길어지면 입력 영역 높이가 자동으로 늘어납니다.\n두 번째 줄\n세 번째 줄\n네 번째 줄\n다섯 번째 줄\n여섯 번째 줄",
  },
};

export const WithoutHelperRow: Story = {
  args: {
    helperText: undefined,
    maxLength: undefined,
  },
};

function ControlledTextArea(args: Story["args"]) {
  const [value, setValue] = useState("");
  const isTooShort = value.length > 0 && value.length < 10;

  return (
    <TextArea
      {...args}
      label={args?.label ?? "레이블"}
      value={value}
      onChange={event => setValue(event.target.value)}
      onClear={() => setValue("")}
      error={isTooShort}
      helperText={isTooShort ? "10자 이상 입력해 주세요" : "Help Text"}
    />
  );
}

export const Controlled: Story = {
  render: args => <ControlledTextArea {...args} />,
};

export const AllStates: Story = {
  render: args => (
    <div className="flex flex-col gap-6">
      <TextArea {...args} />
      <TextArea {...args} defaultValue="입력값" />
      <TextArea {...args} disabled />
      <TextArea {...args} error />
      <TextArea {...args} error defaultValue="입력값" />
      <TextArea {...args} error disabled />
    </div>
  ),
};
