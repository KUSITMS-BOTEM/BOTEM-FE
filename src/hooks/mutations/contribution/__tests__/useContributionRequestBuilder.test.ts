import { renderHook } from "@testing-library/react";

import { fundingService } from "@/apis/funding/fundingService";
import { useContributionRequestBuilder } from "@/hooks/mutations/contribution/useContributionRequestBuilder";

vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: {
    createRollingPaperAttachmentUploadUrl: vi.fn(),
    uploadRollingPaperAttachment: vi.fn(),
  },
}));

const letter = { text: "축하해", name: "민지", color: "orange", paperStyle: "vividSolid" };

const build = (variables: Parameters<ReturnType<typeof useContributionRequestBuilder>>[0]) =>
  renderHook(() => useContributionRequestBuilder(5)).result.current(variables);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fundingService.createRollingPaperAttachmentUploadUrl).mockImplementation(
    async (_id, { attachmentType }) =>
      ({
        attachmentType,
        uploadUrl: `https://s3/${attachmentType}`,
        fileUrl: `https://cdn/${attachmentType}`,
      }) as never,
  );
});

describe("useContributionRequestBuilder", () => {
  it("첨부가 없으면 업로드 없이 편지 본문만 조립한다", async () => {
    const body = await build({ letter, requestKey: "k" });

    expect(fundingService.createRollingPaperAttachmentUploadUrl).not.toHaveBeenCalled();
    expect(body).toMatchObject({ requestKey: "k", paperTemplateCode: "ORANGE_VIVID_SOLID" });
    expect(body.photoUrl).toBeUndefined();
    expect(body).not.toHaveProperty("voiceUrl");
  });

  it("사진을 올리고 photoUrl에 fileUrl을 넣는다", async () => {
    const photo = new File(["p"], "p.png", { type: "image/png" });

    const body = await build({ letter: { ...letter, photo }, requestKey: "k" });

    expect(fundingService.createRollingPaperAttachmentUploadUrl).toHaveBeenCalledWith(5, {
      attachmentType: "PHOTO",
      contentType: "image/png",
      contentLength: 1,
    });
    expect(fundingService.uploadRollingPaperAttachment).toHaveBeenCalledWith(
      "https://s3/PHOTO",
      photo,
    );
    expect(body.photoUrl).toBe("https://cdn/PHOTO");
  });

  it("음성을 올리고 URL·길이·자막을 담으며 자막이 비면 null로 보낸다", async () => {
    const blob = new Blob(["v"], { type: "audio/webm" });

    const withText = await build({
      letter: { ...letter, voice: { blob, durationSeconds: 7, transcript: "안녕" } },
      requestKey: "k",
    });
    const withoutText = await build({
      letter: { ...letter, voice: { blob, durationSeconds: 7, transcript: "" } },
      requestKey: "k",
    });

    expect(withText).toMatchObject({
      voiceUrl: "https://cdn/VOICE",
      voiceDurationSeconds: 7,
      voiceTranscript: "안녕",
    });
    expect(withoutText).toMatchObject({ voiceTranscript: null });
  });

  it("업로드 URL 발급이 비었거나 S3 PUT이 실패하면 reject한다", async () => {
    const photo = new File(["p"], "p.png", { type: "image/png" });

    vi.mocked(fundingService.createRollingPaperAttachmentUploadUrl).mockResolvedValueOnce(
      null as never,
    );
    await expect(build({ letter: { ...letter, photo }, requestKey: "k" })).rejects.toThrow();

    vi.mocked(fundingService.uploadRollingPaperAttachment).mockRejectedValueOnce(new Error("fail"));
    await expect(build({ letter: { ...letter, photo }, requestKey: "k" })).rejects.toThrow("fail");
  });
});
