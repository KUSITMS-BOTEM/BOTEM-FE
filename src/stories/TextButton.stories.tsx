import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextButton from "@/components/TextButton";

const meta = {
  title: "Components/TextButton",
  component: TextButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "버튼",
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColorVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <TextButton color="neutral" label="neutral" />
      <TextButton color="brand" label="brand" />
      <TextButton color="danger" label="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <TextButton size="small" label="small" />
      <TextButton size="medium" label="medium" />
      <TextButton size="large" label="large" />
    </div>
  ),
};

export const WithoutRightIcon: Story = {
  args: {
    rightIcon: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
