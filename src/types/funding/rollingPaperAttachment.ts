export type RollingPaperAttachmentType = "PHOTO" | "VOICE";

export type CreateRollingPaperAttachmentUploadUrlRequest = {
  attachmentType: RollingPaperAttachmentType;
  contentType: string;
  contentLength: number;
};

export type RollingPaperAttachmentUploadUrlResponse = {
  attachmentType: RollingPaperAttachmentType;
  uploadUrl: string;
  fileUrl: string;
};
