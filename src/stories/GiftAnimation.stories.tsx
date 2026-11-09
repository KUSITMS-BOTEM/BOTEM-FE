import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import GiftAnimation from "@/components/effects/GiftAnimation";

const meta = {
  title: "Components/Effects/GiftAnimation",
  component: GiftAnimation,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["wiggle", "open"] },
    className: { control: false },
  },
  args: {
    variant: "wiggle",
  },
} satisfies Meta<typeof GiftAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wiggle: Story = {};

export const Open: Story = {
  args: { variant: "open" },
};
