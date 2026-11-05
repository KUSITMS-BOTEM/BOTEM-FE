"use client";

import { useEffect } from "react";

import { worker } from "@/mocks/browser";

export default function MswInit() {
  useEffect(() => {
    worker.start({ onUnhandledFrame: "bypass" });
  }, []);

  return null;
}
