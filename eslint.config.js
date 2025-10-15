import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Limitar inserção de linhas em branco automáticas (apenas aviso)
      "no-multiple-empty-lines": ["warn", { "max": 1, "maxBOF": 0, "maxEOF": 1 }],
      // Não forçar remoção de linhas vazias dentro de blocos
      "padded-blocks": "off",
      // Não exigir newline no fim do arquivo
      "eol-last": "off"
    }
  }
];

export default eslintConfig;
