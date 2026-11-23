import { render } from "@testing-library/react";

import InAppTopInset from "@/lib/InAppTopInset";

const OFFSET_VAR = "--app-top-offset";

describe("InAppTopInset", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(OFFSET_VAR);
    vi.restoreAllMocks();
  });

  it("구글 앱 인앱 브라우저면 상단 오프셋 변수를 설정한다", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 GSA/300.0 Mobile Safari");

    render(<InAppTopInset />);

    expect(document.documentElement.style.getPropertyValue(OFFSET_VAR)).toBe("62px");
  });

  it("그 외 브라우저에서는 오프셋 변수를 설정하지 않는다", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 Mobile Safari");

    render(<InAppTopInset />);

    expect(document.documentElement.style.getPropertyValue(OFFSET_VAR)).toBe("");
  });
});
