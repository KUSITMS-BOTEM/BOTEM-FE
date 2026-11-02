import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextField, { type TextFieldRule } from "@/components/TextField";

const NAME_RULES: TextFieldRule[] = [
  { message: "한글+영어 조합", validate: value => /[가-힣]/.test(value) && /[a-zA-Z]/.test(value) },
  { message: "특수문자 1개 이상", validate: value => /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/.test(value) },
  { message: "최소 12글자", validate: value => value.length >= 12 },
];

const meta = {
  title: "Components/TextField",
  component: TextField,
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
    suffix: { control: "text" },
    error: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
    rules: { control: false },
  },
  args: {
    label: "레이블",
    placeholder: "플레이스홀더",
    helperText: "Help Text",
    suffix: "원",
    maxLength: 50,
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Focused는 포커스가 있어야 보이는 상태라 스토리가 열리면 input을 클릭한다
const focusInput: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("textbox"));
};

export const Default: Story = {};

export const Focused: Story = {
  play: focusInput,
};

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

export const ErrorFocused: Story = {
  args: {
    error: true,
  },
  play: focusInput,
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

export const WithoutSuffix: Story = {
  args: {
    suffix: undefined,
  },
};

export const WithRules: Story = {
  args: {
    label: "이름",
    placeholder: "입력해주세요",
    required: true,
    suffix: undefined,
    helperText: undefined,
    rules: NAME_RULES,
  },
};

function ControlledTextField(args: Story["args"]) {
  const [value, setValue] = useState("");

  return (
    <TextField
      {...args}
      label={args?.label ?? "레이블"}
      value={value}
      onChange={event => setValue(event.target.value)}
      onClear={() => setValue("")}
    />
  );
}

export const Controlled: Story = {
  render: args => <ControlledTextField {...args} />,
};

export const AllStates: Story = {
  render: args => (
    <div className="flex flex-col gap-6">
      <TextField {...args} />
      <TextField {...args} defaultValue="입력값" />
      <TextField {...args} disabled />
      <TextField {...args} error />
      <TextField {...args} error defaultValue="입력값" />
      <TextField {...args} error disabled />
    </div>
  ),
};
