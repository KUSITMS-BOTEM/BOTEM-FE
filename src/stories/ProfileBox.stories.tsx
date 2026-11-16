import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ProfileBox from "@/components/ProfileBox";
import SampleProduct from "@/assets/images/samples/sample-product.png";

const meta = {
  title: "Components/ProfileBox",
  component: ProfileBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    profiles: { control: "object" },
    extraCount: { control: { type: "number", min: 0 } },
    notification: { control: "boolean" },
  },
  args: {
    profiles: [{ color: "orange" }],
    extraCount: 99,
    notification: false,
  },
} satisfies Meta<typeof ProfileBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Notification: Story = {
  args: { notification: true },
};

export const ThreeProfiles: Story = {
  args: { profiles: [{ color: "orange" }, { color: "lime" }, { color: "pink" }] },
};

export const WithoutExtraCount: Story = {
  args: { profiles: [{ color: "orange" }, { color: "lime" }], extraCount: 0 },
};

// 프로필 이미지가 없는 참여자는 색 아이콘으로 대체된다
export const WithProfileImages: Story = {
  args: {
    profiles: [
      { color: "orange", imageUrl: SampleProduct.src },
      { color: "lime" },
      { color: "pink", imageUrl: SampleProduct.src },
    ],
  },
};
