import { config as baseConfig } from "@repo/eslint-config/base";

const restrictedBoundaries = [
  {
    files: ["packages/core/src/**/*.{ts,tsx}"],
    patterns: ["@repo/event-service", "@repo/event-service/*", "@repo/car-service", "@repo/car-service/*"],
    message: "Core cannot depend on business services. Use events/shared contracts.",
  },
  {
    files: ["packages/event-service/src/**/*.{ts,tsx}"],
    patterns: ["@repo/car-service", "@repo/car-service/*"],
    message: "event-service cannot import car-service directly.",
  },
  {
    files: ["packages/car-service/src/**/*.{ts,tsx}"],
    patterns: ["@repo/event-service", "@repo/event-service/*"],
    message: "car-service cannot import event-service directly.",
  },
];

export default [
  ...baseConfig,
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.turbo/**"],
  },
  ...restrictedBoundaries.map((rule) => ({
    files: rule.files,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: rule.patterns
            .filter((name) => !name.includes("*"))
            .map((name) => ({ name, message: rule.message })),
          patterns: [
            {
              group: [
                ...rule.patterns,
                "../event-service/**",
                "../../event-service/**",
                "../car-service/**",
                "../../car-service/**",
              ],
              message: rule.message,
            },
          ],
        },
      ],
    },
  })),
];
