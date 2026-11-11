export type CreateProfileImageUploadUrlRequest = {
  contentType: string;
  contentLength: number;
};

export type ProfileImageUploadUrlResponse = {
  uploadUrl: string;
  imageUrl: string;
};
