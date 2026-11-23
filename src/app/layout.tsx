import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

import { cn } from "@/utils/cn";
import MswProvider from "@/lib/MswProvider";
import QueryProvider from "@/lib/QueryProvider";
import GlobalErrorDialog from "@/lib/GlobalErrorDialog";
import InAppTopInset from "@/lib/InAppTopInset";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaId =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? process.env.NEXT_PUBLIC_GA_ID : undefined;

export const metadata: Metadata = {
  title: "보탬 | 작게 보태는 선물 펀딩",
  description: "선물하고 싶은 대상을 위해 함께 돈을 모으는 퍼스널 크라우드 펀딩 서비스",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 브라우저 확장(번역·색상 추출 등)이 html·body에 속성을 주입해 생기는 hydration 경고를 막는다
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning>
      <body
        className="flex min-h-full flex-col pt-[calc(env(safe-area-inset-top)+var(--app-top-offset,0px))]"
        suppressHydrationWarning>
        <InAppTopInset />
        <div className={cn("mx-auto flex w-full flex-1 flex-col", APP_MAX_WIDTH_CLASS)}>
          <MswProvider>
            <QueryProvider>
              {children}
              <GlobalErrorDialog />
            </QueryProvider>
          </MswProvider>
        </div>
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
