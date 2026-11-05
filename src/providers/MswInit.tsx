"use client";

import { useEffect, useRef } from "react";

import { worker } from "@/mocks/browser";

export default function MswInit() {
  const hasStarted = useRef(false);

  useEffect(() => {
    // StrictMode의 effect 이중 실행으로 worker.start()가 두 번 호출되는 것을 막는다 — 이미 활성화된 네트워크를
    // 다시 configure()하려 하면 "cannot configure an already enabled network" 에러가 난다.
    if (hasStarted.current) return;
    hasStarted.current = true;

    worker.start({ onUnhandledFrame: "bypass" });
  }, []);

  return null;
}
