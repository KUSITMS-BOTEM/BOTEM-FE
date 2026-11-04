import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Badge from "@/components/Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    color: { control: "inline-radio", options: ["neutral", "brand", "danger", "ghost"] },
    variant: { control: "inline-radio", options: ["fill", "weak"] },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
  args: {
    label: "뱃지",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Medium: Story = {
  args: {
    size: "medium",
  },
};

export const AllVariants: Story = {
  render: args => (
    <div className="grid grid-cols-7 items-center justify-items-start gap-4">
      {(["small", "medium"] as const).map(size => (
        <div key={size} className="contents">
          <Badge label={args.label} size={size} color="neutral" variant="fill" />
          <Badge label={args.label} size={size} color="neutral" variant="weak" />
          <Badge label={args.label} size={size} color="ghost" />
          <Badge label={args.label} size={size} color="brand" variant="weak" />
          <Badge label={args.label} size={size} color="brand" variant="fill" />
          <Badge label={args.label} size={size} color="danger" variant="fill" />
          <Badge label={args.label} size={size} color="danger" variant="weak" />
        </div>
      ))}
    </div>
  ),
};
