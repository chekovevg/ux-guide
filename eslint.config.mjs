import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "dist/**", "build/**", "next-env.d.ts"],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
