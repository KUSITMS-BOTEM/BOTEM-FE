import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LetterRecordSheet from "@/widgets/letter-paper/LetterRecordSheet";

const meta = {
  title: "Widgets/LetterPaper/LetterRecordSheet",
  component: LetterRecordSheet,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "툴 선택 영역에서 녹음을 고르면 나타나는 녹음 영역. 대기 → 녹음 중(실시간 자막, 한 줄이 차면 위로 사라지고 다음 줄 시작) → 완료(자막 스크롤, 재녹음/녹음 완료) 순서로 바뀐다. 상태는 useVoiceRecorder 훅이 만들어 props로 내려준다.",
      },
    },
  },
  decorators: [
    Story => (
      <div className="bg-semantic-background-default w-[360px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    status: "idle",
    error: null,
    color: "lime",
    transcript: "",
    interim: "",
    onStart: () => {},
    onStop: () => {},
    onDone: () => {},
    onClose: () => {},
  },
  argTypes: {
    color: { control: "inline-radio", options: ["orange", "pink", "lime", "blue"] },
    onStart: { action: "start" },
    onStop: { action: "stop" },
    onDone: { action: "done" },
    onClose: { action: "closed" },
  },
} satisfies Meta<typeof LetterRecordSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {};

export const Recording: Story = {
  args: { status: "recording", transcript: "생일 축하해,", interim: "그래서 내가" },
};

export const Done: Story = {
  args: {
    status: "done",
    transcript:
      "생일 축하해, 그래서 내가 이번에 준비한 선물이 있는데 마음에 들었으면 좋겠다. 올해도 같이 많이 웃자.",
  },
};

export const NoCaption: Story = { args: { status: "done" } };

export const Unsupported: Story = { args: { error: "unsupported" } };

export const PermissionDenied: Story = { args: { error: "denied" } };
