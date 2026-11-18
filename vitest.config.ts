import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

import svgr from "vite-plugin-svgr";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    // `--coverage`를 줄 때만 측정한다. 대상은 단위 테스트 대상 계층으로 한정
    coverage: {
      provider: "v8",
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/widgets/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/utils/**/*.{ts,tsx}",
      ],
      exclude: ["**/__tests__/**"],
      reporter: ["text", "json-summary"],
    },
    projects: [
      {
        extends: true,
        plugins: [svgr({ svgrOptions: { replaceAttrValues: { "#222222": "currentColor" } } })],
        resolve: {
          alias: {
            "@": path.resolve(dirname, "src"),
          },
        },
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          // CI에는 .env가 없어 BASE_URL이 빈 문자열이면 상대 URL로 Request 생성이 실패해 MSW까지 가지 않는다. 로컬·CI를 같은 값으로 고정
          env: { NEXT_PUBLIC_API_BASE_URL: "http://localhost" },
          // 전체를 병렬로 돌리면 부하로 느려진 테스트가 기본 5초를 넘겨 번갈아 실패한다. 근본 해결은 docs/todos/unit_test_parallel_flaky.md
          testTimeout: 15000,
          include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        plugins: [
          svgr({ svgrOptions: { replaceAttrValues: { "#222222": "currentColor" } } }),
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
