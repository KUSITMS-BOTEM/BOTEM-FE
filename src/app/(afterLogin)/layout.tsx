"use client";

import { type ReactNode } from "react";

import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";

export default function AfterLoginLayout({ children }: { children: ReactNode }) {
  useMyProfileQuery();

  return children;
}
