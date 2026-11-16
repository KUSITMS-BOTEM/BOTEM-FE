import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";

const meta = {
  title: "Widgets/LetterPaper/LetterWriteSheet",
  component: LetterWriteSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      story: { inline: false, height: "720px" },
      description: {
        component:
          "편지지 작성 시트의 1·2단계(편지 작성 → 툴 추가). `isLoggedIn`이 false면 편지지 위에 친구에게 보여질 이름 입력란이 나타난다. 팔레트의 플러스 버튼을 누르면 툴 선택 영역이 열리고, 안내 말풍선은 그 뒤로 다시 나타나지 않는다.",
      },
    },
  },
} satisfies Meta<typeof LetterWriteSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>시트 열기</Button>
      <LetterWriteSheet
        open={open}
        onClose={() => setOpen(false)}
        recipientName="지유"
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}

export const LoggedIn: Story = {
  args: { open: true, onClose: () => {}, recipientName: "지유", isLoggedIn: true },
  render: () => <Demo isLoggedIn />,
};

export const Guest: Story = {
  args: { open: true, onClose: () => {}, recipientName: "지유", isLoggedIn: false },
  render: () => <Demo isLoggedIn={false} />,
};
