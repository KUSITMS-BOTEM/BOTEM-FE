import { type ComponentProps, Fragment } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Asset from "@/components/Asset";
import Button from "@/components/Button";
import List from "@/components/List";
import ListText from "@/components/ListText";
import IconCheck from "@/assets/icons/icon-check.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

const meta = {
  title: "Components/List",
  component: List,
  parameters: {
    layout: "centered",
  },
  decorators: [
    Story => (
      <div className="w-[340px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    type: { control: "inline-radio", options: ["product", "default"] },
    title: { control: "text" },
    description: { control: "text" },
    leading: { control: false },
    thumbnailSrc: { control: "text" },
    thumbnailAlt: { control: "text" },
    right: { control: false },
  },
  args: {
    title: "타이틀",
    description: "설명",
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const RIGHT_BUTTON = (
  <Button size="small" className="px-[14.5px] py-2">
    버튼
  </Button>
);
const RIGHT_TEXT = (
  <ListText title="타이틀" description="설명" align="right" className="w-[95px]" />
);
const RIGHT_ICON = (
  <Asset
    icon={<IconCheck />}
    size="small"
    className="text-semantic-icon-default [&_path]:[vector-effect:non-scaling-stroke]"
  />
);

export const ProductButton: Story = {
  args: { type: "product", right: RIGHT_BUTTON },
};

export const ProductText: Story = {
  args: { type: "product", right: RIGHT_TEXT },
};

export const ProductIcon: Story = {
  args: { type: "product", right: RIGHT_ICON },
};

export const DefaultButton: Story = {
  args: { type: "default", leading: <IconRight />, right: RIGHT_BUTTON },
};

export const DefaultText: Story = {
  args: { type: "default", leading: <IconRight />, right: RIGHT_TEXT },
};

export const DefaultIcon: Story = {
  args: { type: "default", leading: <IconRight />, right: RIGHT_ICON },
};

export const LongText: Story = {
  args: {
    type: "product",
    title: "아주 긴 상품 이름이 들어가서 한 줄을 넘어가면 말줄임 처리가 됩니다",
    description: "설명도 길어지면 아래로 줄바꿈이 됩니다. 설명도 길어지면 아래로 줄바꿈이 됩니다.",
    right: RIGHT_BUTTON,
  },
};

const LIST_TEXT_CASES: Omit<ComponentProps<typeof ListText>, "title" | "align">[] = [
  {},
  { description: "설명" },
  { description: "설명", titleUp: true },
  { description: "설명", type: "price" },
  { description: "설명", type: "price", titleUp: true },
];

export const ListTextVariants: Story = {
  render: () => (
    <div className="grid grid-cols-[210px_95px] justify-between gap-y-6">
      {LIST_TEXT_CASES.map((props, index) => (
        <Fragment key={index}>
          <ListText title="타이틀" {...props} />
          <ListText title="타이틀" {...props} align="right" />
        </Fragment>
      ))}
    </div>
  ),
};
