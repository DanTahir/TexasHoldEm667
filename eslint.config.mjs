import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ["build/", "tailwind.config.js"],
  },
];
