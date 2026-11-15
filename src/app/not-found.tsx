"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// isLoggedIn 쿠키는 httpOnly라 여기서 읽을 수 없다. "/"로 보내면 proxy.ts가 로그인 사용자를 /home으로 다시 보낸다.
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
