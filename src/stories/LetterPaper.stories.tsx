import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterPaper from "@/widgets/letter-paper/LetterPaper";
import IconSticker from "@/assets/icons/multicolor/letter-tool-sticker.svg?react";

const LONG_TEXT =
  "지유야 생일 축하해! 올해도 같이 많이 웃고 맛있는 것도 많이 먹자. 항상 곁에서 힘이 돼줘서 고마워. 앞으로도 오래오래 함께하자. 사랑해 우리 지유 생일 정말 정말 축하해! 건강하고 행복하자!";

const meta = {
  title: "Widgets/LetterPaper/LetterPaper",
  component: LetterPaper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "받는 사람에게 보여주는 편지지. `style`(5종) × `color`(4종) 조합으로 배경·점 패턴·글자색이 정해진다. 사진 슬롯 1개와 아이콘 슬롯 2개는 고정 위치에 회전되어 놓이고, 텍스트는 슬롯을 비껴가도록 흐른다. 텍스트는 110자 이하 20px, 111자 이상 17px이며, 글자 폭이 제각각이라 글자 수로 자르지 않고 고정 높이 영역(20px 9줄, 17px 11줄)을 넘는 부분을 잘라낸다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    style: {
      control: "select",
      options: ["vividSolid", "colorDot", "whiteDot", "dotGrid", "solid"],
    },
    color: { control: "inline-radio", options: ["orange", "pink", "lime", "blue"] },
    text: { control: "text", description: "편지 본문. 영역을 넘는 부분은 잘린다" },
    senderName: { control: "text", description: "'From.' 뒤에 붙는 작성자 이름" },
    hasVoiceMessage: { control: "boolean" },
  },
  args: {
    style: "vividSolid",
    color: "orange",
    text: "지유야 생일 축하해! 올해도 같이 많이 웃자",
    senderName: "민지",
    hasVoiceMessage: true,
  },
} satisfies Meta<typeof LetterPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MediumText: Story = {
  args: { text: LONG_TEXT.slice(0, 130) },
  parameters: { docs: { description: { story: "111자 이상은 17px로 줄어든다." } } },
};

export const MaxText: Story = {
  args: { text: LONG_TEXT.repeat(2) },
  parameters: {
    docs: { description: { story: "영역을 넘는 글은 잘리고, 푸터는 제자리에 있다." } },
  },
};

export const WidestChars: Story = {
  args: { text: "ㅇ".repeat(300) },
  parameters: {
    docs: { description: { story: "가장 넓은 글자(ㅇ)를 길게 넣어도 푸터가 밀리지 않는다." } },
  },
};

export const WithIcons: Story = {
  args: {
    largeIcon: <IconSticker aria-hidden className="size-full" />,
    smallIcon: <IconSticker aria-hidden className="size-full" />,
  },
};

export const WhiteDotLime: Story = {
  args: { style: "whiteDot", color: "lime" },
  parameters: { docs: { description: { story: "whiteDot에서 lime만 검정 글씨를 쓴다." } } },
};

export const AllVariants: Story = {
  parameters: { layout: "padded" },
  render: args => (
    <div className="flex flex-col gap-6">
      {(["vividSolid", "colorDot", "whiteDot", "dotGrid", "solid"] as const).map(style => (
        <div key={style} className="flex gap-6">
          {(["orange", "pink", "lime", "blue"] as const).map(color => (
            <LetterPaper key={color} {...args} style={style} color={color} />
          ))}
        </div>
      ))}
    </div>
  ),
};
