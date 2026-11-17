import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import VoiceMessage from "@/widgets/letter-paper/VoiceMessage";
import type { Color } from "@/constants/color";

const getBars = (container: HTMLElement) => Array.from(container.querySelectorAll("span"));

describe("VoiceMessage", () => {
  it("color를 지정하지 않으면 파형 막대가 pink다", () => {
    const { container } = render(<VoiceMessage />);

    const bars = getBars(container);
    expect(bars).toHaveLength(5);
    bars.forEach(bar => expect(bar).toHaveClass("bg-base-pink-500"));
  });

  it.each<[Color, string]>([
    ["orange", "bg-base-orange-500"],
    ["pink", "bg-base-pink-500"],
    ["lime", "bg-base-lime-500"],
    ["blue", "bg-base-blue-500"],
  ])("color가 %s이면 파형 막대 5개가 모두 %s다", (color, bgClass) => {
    const { container } = render(<VoiceMessage color={color} />);

    const bars = getBars(container);
    expect(bars).toHaveLength(5);
    bars.forEach(bar => expect(bar).toHaveClass(bgClass));
  });

  it("파형 막대 높이가 8·14·22·18·8px 순서다", () => {
    const { container } = render(<VoiceMessage />);

    const heights = ["h-2", "h-3.5", "h-[22px]", "h-[18px]", "h-2"];
    getBars(container).forEach((bar, index) => expect(bar).toHaveClass(heights[index]));
  });

  describe("audio 재생", () => {
    const players: { pause: ReturnType<typeof vi.fn>; onended?: () => void }[] = [];

    beforeEach(() => {
      players.length = 0;
      URL.createObjectURL = vi.fn(() => "blob:x");
      URL.revokeObjectURL = vi.fn();
      vi.stubGlobal(
        "Audio",
        vi.fn(function () {
          const player = { pause: vi.fn(), play: vi.fn(() => Promise.resolve()) } as never;
          players.push(player);
          return player;
        }),
      );
    });

    afterEach(() => vi.unstubAllGlobals());

    const audio = new Blob(["a"], { type: "audio/webm" });

    it("버튼을 누르면 배경이 팔레트 색·파형이 검은색으로 바뀌고, 다시 누르면 원래대로 돌아온다", async () => {
      const { container } = render(<VoiceMessage color="pink" audio={audio} />);

      await userEvent.click(screen.getByRole("button", { name: "음성 메시지 재생" }));
      const stopButton = screen.getByRole("button", { name: "음성 메시지 정지" });
      expect(stopButton).toHaveClass("bg-base-pink-500");
      getBars(container).forEach(bar => expect(bar).toHaveClass("bg-black"));

      await userEvent.click(stopButton);
      expect(players[0].pause).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "음성 메시지 재생" })).toHaveClass(
        "bg-semantic-fill-neutral",
      );
      getBars(container).forEach(bar => expect(bar).toHaveClass("bg-base-pink-500"));
    });

    it("수동으로 정지하거나 언마운트하면 object URL을 해제한다", async () => {
      const { unmount } = render(<VoiceMessage audio={audio} />);

      await userEvent.click(screen.getByRole("button", { name: "음성 메시지 재생" }));
      await userEvent.click(screen.getByRole("button", { name: "음성 메시지 정지" }));
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");

      await userEvent.click(screen.getByRole("button", { name: "음성 메시지 재생" }));
      unmount();
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });

    it("재생이 끝나면 원래 색으로 돌아온다", async () => {
      render(<VoiceMessage audio={audio} />);

      await userEvent.click(screen.getByRole("button", { name: "음성 메시지 재생" }));
      act(() => players[0].onended?.());

      expect(screen.getByRole("button", { name: "음성 메시지 재생" })).toBeInTheDocument();
    });
  });

  it("className을 넘기면 루트에 병합되고 기본 클래스는 유지된다", () => {
    const { container } = render(<VoiceMessage className="mt-4" />);

    expect(container.firstElementChild).toHaveClass("mt-4", "rounded-full");
  });
});
