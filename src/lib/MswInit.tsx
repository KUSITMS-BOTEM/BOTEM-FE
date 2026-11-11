"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { worker } from "@/mocks/browser";

export default function MswInit({ children }: { children: ReactNode }) {
  const hasStarted = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // StrictMode의 effect 이중 실행으로 worker.start()가 두 번 호출되는 것을 막는다 — 이미 활성화된 네트워크를
    // 다시 configure()하려 하면 "cannot configure an already enabled network" 에러가 난다.
    if (hasStarted.current) return;
    hasStarted.current = true;

    worker.start({ onUnhandledFrame: "bypass" }).then(() => setIsReady(true));
  }, []);

  // worker.start()가 끝나기 전에 자식이 먼저 마운트되면, 마운트 시점에 쏘는 요청이 모킹을 비켜갈 수 있다.
  if (!isReady) return null;
  return <>{children}</>;
}
