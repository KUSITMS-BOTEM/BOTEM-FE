"use client";

import dynamic from "next/dynamic";

// msw/browser는 서버 번들에서 resolve가 막혀 있어(msw의 exports에서 "node" 조건이 null) ssr:false로 완전히 분리한다.
const MswInit = dynamic(() => import("./MswInit"), { ssr: false });

const MSW_ENABLED = process.env.NEXT_PUBLIC_MSW_ENABLED === "1";

export default function MswProvider() {
  if (!MSW_ENABLED) return null;

  return <MswInit />;
}
