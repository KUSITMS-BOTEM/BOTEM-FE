import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import AssetSlot from "@/widgets/letter-paper/AssetSlot";
import IconSticker from "@/assets/icons/multicolor/letter-tool-sticker.svg?react";

const meta = {
  title: "Widgets/LetterPaper/AssetSlot",
  component: AssetSlot,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "편지지 작성 페이지에서 스티커·사진을 놓는 슬롯. 비어 있으면 점선 테두리와 플러스 아이콘을 보여주고, 채워지면 테두리·배경 없이 내용만 보여준다. `type`에 따라 `icon`(50×50)과 `photo`(120×120) 두 종류다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["icon", "photo"],
      description:
        "슬롯 종류. `icon`은 `asset`·`onClick`, `photo`는 `onImageChange`를 받는 서로 다른 props 조합이다.",
    },
    className: { control: "text", description: "루트 `<button>`에 병합되는 클래스" },
  },
  args: {
    type: "icon",
  },
} satisfies Meta<typeof AssetSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "`type=icon`, `asset` 없음. 점선 테두리와 플러스 아이콘(16px)을 보여준다.",
      },
    },
  },
};

export const IconWithAsset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`type=icon`에 `asset`을 넘기면 테두리·배경이 사라지고 슬롯 영역 안에 `asset`이 표시된다.",
      },
    },
  },
  args: {
    type: "icon",
    asset: <IconSticker aria-hidden className="size-full" />,
  },
};

export const Photo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`type=photo`. 누르면 기기에서 사진을 고르고, 선택한 사진이 120×120 영역을 채운다(`object-cover`). 사진 선택 후에는 테두리가 사라지며 다시 눌러 교체할 수 있다. 선택한 파일은 `onImageChange(file)`로 전달된다.",
      },
    },
  },
  args: {
    type: "photo",
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: { description: { story: "비어 있는 상태의 icon·photo와 asset이 채워진 icon 비교." } },
  },
  render: () => (
    <div className="flex items-center gap-6">
      <AssetSlot type="icon" />
      <AssetSlot type="icon" asset={<IconSticker aria-hidden className="size-full" />} />
      <AssetSlot type="photo" />
    </div>
  ),
};
