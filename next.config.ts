import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // BE가 내려주는 위시 프로필 링크(wishProfileUrl)가 /@{wishProfileKey} 형식이라 주소는 그대로 두고 화면만 연결한다
  async rewrites() {
    return [{ source: "/@:wishProfileKey", destination: "/share/profile/:wishProfileKey" }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              replaceAttrValues: { "#222222": "currentColor", "#222": "currentColor" },
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                  // preset-default가 id를 a·b로 줄이면 SVG끼리 id가 겹쳐 다른 SVG의 gradient·filter를 참조한다
                  "prefixIds",
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // 토큰이 없으면(로컬·CI) 소스맵 업로드만 건너뛰고 빌드는 계속된다
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
