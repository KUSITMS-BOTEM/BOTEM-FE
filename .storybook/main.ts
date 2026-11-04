import type { StorybookConfig } from "@storybook/nextjs-vite";

import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  async viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(
      tailwindcss(),
      svgr({ svgrOptions: { replaceAttrValues: { "#222222": "currentColor" } } }),
    );
    return viteConfig;
  },
};
export default config;
