import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});


const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Add custom rules here
  {
    rules: {
      // Allow 'any' just in a few places (optional)
      "@typescript-eslint/no-explicit-any": "off",
      // Ignore unused variables that start with '_'
      "@typescript-eslint/no-unused-vars": ["off", { "argsIgnorePattern": "^_" }],
    },
  },
];

export default eslintConfig;
