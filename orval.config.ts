import { defineConfig } from "orval";

const swaggerAuth = Buffer.from(
  `${process.env.BOTEM_SWAGGER_USER}:${process.env.BOTEM_SWAGGER_PASSWORD}`,
).toString("base64");

export default defineConfig({
  botem: {
    input: {
      target: "https://api.botem.site/v3/api-docs",
      parserOptions: {
        headers: [
          { domains: ["api.botem.site"], headers: { Authorization: `Basic ${swaggerAuth}` } },
        ],
      },
    },
    output: {
      mode: "tags-split",
      client: "react-query",
      httpClient: "fetch",
      target: "./src/apis/generated",
      schemas: "./src/apis/generated/model",
      clean: true,
      mock: { generators: [{ type: "msw", path: "./src/mocks/generated" }] },
    },
  },
});
