import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Combobox from "@/components/Combobox";

const meta = {
  title: "Components/Combobox",
  component: Combobox,
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
    chipPosition: { control: "inline-radio", options: ["top", "bottom"] },
    chipWrap: { control: "boolean" },
    chips: { control: false },
  },
  args: {
    label: "레이블",
    placeholder: "플레이스홀더",
    helperText: "Help Text",
    suffix: "원",
    maxLength: 50,
    chips: [{ label: "Chip", value: "chip" }],
  },
} satisfies Meta<typeof Combobox>;

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

export const ChipBottom: Story = {
  args: {
    chipPosition: "bottom",
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

export const AllStates: Story = {
  render: args => (
    <div className="flex flex-col gap-6">
      <Combobox {...args} />
      <Combobox {...args} defaultValue="입력값" />
      <Combobox {...args} disabled />
      <Combobox {...args} error />
      <Combobox {...args} error defaultValue="입력값" />
      <Combobox {...args} error disabled />
    </div>
  ),
};
