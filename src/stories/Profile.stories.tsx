import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Profile from "@/components/Profile";
import SampleProduct from "@/assets/images/samples/sample-product.png";

const meta = {
  title: "Components/Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    imageUrl: { control: false },
    onImageChange: { control: false },
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  args: { imageUrl: SampleProduct.src },
};

export const WithoutIconButton: Story = {
  args: { showIconButton: false },
};
