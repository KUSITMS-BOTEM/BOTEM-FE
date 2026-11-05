"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// msw/browser는 서버 번들에서 resolve가 막혀 있어(msw의 exports에서 "node" 조건이 null) ssr:false로 완전히 분리한다.
const MswInit = dynamic(() => import("./MswInit"), { ssr: false });

// 운영 환경변수 설정 실수로 실제 유저 로그인까지 가짜 응답으로 가로채지 않도록 production 빌드에서는 값과 무관하게 막는다.
const MSW_ENABLED =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MSW_ENABLED === "1";

export default function MswProvider({ children }: { children: ReactNode }) {
  if (!MSW_ENABLED) return children;

  return <MswInit>{children}</MswInit>;
}
