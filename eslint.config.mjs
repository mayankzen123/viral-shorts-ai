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
  {
    // Disable all rules globally (convert errors to warnings)
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
      noInlineConfig: false,
    },
    rules: {
      // Set all Next.js and TypeScript rules to warn instead of error
      '@next/next/no-html-link-for-pages': 'warn',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Add more specific rules as needed
      
      // Disable all other rules (fallback)
      '**/*': 'warn',
    },
  },
];

export default eslintConfig;
