import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import WishCard from "@/widgets/main/WishCard";
import SampleProduct from "@/assets/images/samples/sample-product.png";

const meta = {
  title: "Widgets/Main/WishCard",
  component: WishCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-12">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: { control: "inline-radio", options: ["funding", "default", "button"] },
    productImageUrl: { control: false },
    onOpenFunding: { control: false },
    className: { control: false },
  },
  args: {
    type: "funding",
    productName: "{상품명}",
    price: 39000,
    productImageUrl: SampleProduct.src,
    onOpenFunding: fn(),
  },
} satisfies Meta<typeof WishCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Funding: Story = {};

export const Default: Story = {
  args: { type: "default" },
};

export const WithButton: Story = {
  args: { type: "button" },
};
