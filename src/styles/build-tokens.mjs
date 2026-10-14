import { register } from "@tokens-studio/sd-transforms";
import StyleDictionary from "style-dictionary";

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ["src/styles/tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      prefix: "token",
      files: [
        {
          destination: "src/styles/tokens.css",
          format: "css/variables",
          options: {
            selector: "@theme",
          },
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
