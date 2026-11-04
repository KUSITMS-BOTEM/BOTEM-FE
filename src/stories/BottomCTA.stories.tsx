import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import TextButton from "@/components/TextButton";
import { cn } from "@/utils/cn";

const meta = {
  title: "Components/BottomCTA",
  component: BottomCTA,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    // transform으로 containing block을 만들어 fixed CTA가 뷰포트 대신 이 박스 하단에 붙게 한다(autodocs 겹침 방지)
    Story => (
      <div className="min-h-[236px] [transform:translateZ(0)]">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <Button size="xlarge" color="brand">
        자세히보기
      </Button>
    ),
  },
} satisfies Meta<typeof BottomCTA>;

export default meta;
type Story = StoryObj<typeof BottomCTA>;

// Figma Upper/Lower Item의 component variant(Checkbox · Text Button · Description)
const ITEM_VARIANTS = {
  Checkbox: <CheckBox label="체크박스 레이블" />,
  "Text Button": (
    <TextButton size="medium" label="자세히보기" className="text-semantic-text-secondary" />
  ),
  Description: (
    <p className="text-semantic-text-tertiary flex-1 text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
      추가 설명이 여기 들어갑니다.
      <br />
      최대 두줄까지만 사용합니다.
    </p>
  ),
};

const ItemSheet = ({ position }: { position: "upper" | "lower" }) => (
  <div className="bg-semantic-fill-neutral-weak flex justify-center p-5">
    <div className="bg-semantic-background-default flex h-[236px] w-[407px] items-center justify-center">
      <div className="grid w-[375px] grid-rows-[50px_50px_56px] gap-4">
        {Object.entries(ITEM_VARIANTS).map(([name, item]) => (
          <div
            key={name}
            className={cn("flex justify-center px-6", position === "upper" ? "pb-6" : "pt-6")}>
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const OneButton: Story = {};

export const TwoButtonsBrand: Story = {
  args: {
    children: (
      <>
        <Button size="xlarge" color="brand" variant="weak">
          추가하기
        </Button>
        <Button size="xlarge" color="brand">
          자세히보기
        </Button>
      </>
    ),
  },
};

export const TwoButtonsVerticalBrand: Story = {
  args: {
    direction: "vertical",
    children: (
      <>
        <Button size="xlarge" color="brand">
          자세히보기
        </Button>
        <Button size="xlarge" color="brand" variant="weak">
          추가하기
        </Button>
      </>
    ),
  },
};

export const TwoButtonsNeutral: Story = {
  args: {
    children: (
      <>
        <Button size="xlarge" variant="weak">
          닫기
        </Button>
        <Button size="xlarge" color="brand">
          자세히보기
        </Button>
      </>
    ),
  },
};

export const TwoButtonsVerticalNeutral: Story = {
  args: {
    direction: "vertical",
    children: (
      <>
        <Button size="xlarge" color="brand">
          자세히보기
        </Button>
        <Button size="xlarge" variant="weak">
          닫기
        </Button>
      </>
    ),
  },
};

export const SocialLogin: Story = {
  render: () => <BottomCTA type="kakao" onClick={() => {}} />,
};

export const UpperItem: Story = {
  render: () => <ItemSheet position="upper" />,
};

export const LowerItem: Story = {
  render: () => <ItemSheet position="lower" />,
};
