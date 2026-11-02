import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Chip from "@/components/Chip";
import IconRight from "@/assets/icons/icon-right.svg?react";

const Logo = () => (
  <span className="text-semantic-text-tertiary [font:var(--semantic-label-x-small)]">T</span>
);

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    size: { control: "inline-radio", options: ["small", "medium"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    logo: { control: false },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
  args: {
    label: "Chip",
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Small: Story = {
  args: {
    size: "small",
  },
};

export const WithLogo: Story = {
  args: {
    logo: <Logo />,
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: <IconRight aria-hidden />,
    rightIcon: <IconRight aria-hidden />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: args => (
    <div className="grid grid-cols-2 items-center justify-items-start gap-4">
      <Chip {...args} size="small" />
      <Chip {...args} size="medium" />
      <Chip {...args} size="small" selected />
      <Chip {...args} size="medium" selected />
      <Chip {...args} size="small" logo={<Logo />} />
      <Chip {...args} size="medium" logo={<Logo />} />
    </div>
  ),
};

function ToggleChip(args: Story["args"]) {
  const [selected, setSelected] = useState(false);

  return (
    <Chip
      {...args}
      label={args?.label ?? "Chip"}
      selected={selected}
      onClick={() => setSelected(prev => !prev)}
    />
  );
}

export const Toggle: Story = {
  render: args => <ToggleChip {...args} />,
};
