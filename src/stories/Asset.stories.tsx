import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Asset from "@/components/Asset";

const RightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-full">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: "Components/Asset",
  component: Asset,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: { control: false },
  },
  args: {
    icon: <RightIcon />,
  },
} satisfies Meta<typeof Asset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Asset size="xsmall" icon={<RightIcon />} />
      <Asset size="small" icon={<RightIcon />} />
      <Asset size="medium" icon={<RightIcon />} />
      <Asset size="large" icon={<RightIcon />} />
    </div>
  ),
};
