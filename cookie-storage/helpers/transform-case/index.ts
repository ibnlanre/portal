import type { CaseType } from "@/cookie-storage/types/case-type";

export function transformCase(text: string, caseType?: CaseType): string {
  switch (caseType) {
    case "camel":
      return text
        .toLowerCase()
        .replace(/[-_ ](.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
    case "kebab":
      return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[_]/g, "-")
        .replace(/-+/g, "-");
    case "lower":
      return text.toLowerCase();
    case "pascal":
      return text
        .toLowerCase()
        .replace(/(?:^|\s+|[-_])(.)/g, (_, char) => char.toUpperCase())
        .replace(/[-_ ]/g, "");
    case "sentence":
      return text.toLowerCase().replace(/^[a-z]/, (char) => char.toUpperCase());
    case "title":
      return text.replace(/\b\w/g, (char) => char.toUpperCase());
    case "upper":
      return text.toUpperCase();
    default:
      return text.toLowerCase();
  }
}
