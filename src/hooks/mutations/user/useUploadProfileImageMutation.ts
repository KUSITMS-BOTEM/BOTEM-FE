import { useMutation } from "@tanstack/react-query";

import { userService } from "@/apis/user/userService";

export const useUploadProfileImageMutation = () =>
  useMutation({
    // presigned URL 발급 → S3 PUT까지 묶어야 "이미지 업로드" 한 동작이 된다
    mutationFn: async (file: File) => {
      const result = await userService.createProfileImageUploadUrl({
        contentType: file.type,
        contentLength: file.size,
      });
      if (!result) throw new Error("업로드 URL 발급에 실패했습니다.");
      await userService.uploadProfileImage(result.uploadUrl, file);
      return result.imageUrl;
    },
  });
