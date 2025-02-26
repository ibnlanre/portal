export function transformCase(
  text: string,
  caseType: "title" | "lower" | "upper" | "camel" | "pascal"
): string {
  switch (caseType) {
    case "title":
      return text.replace(/\b\w/g, (char) => char.toUpperCase());
    case "upper":
      return text.toUpperCase();
    case "camel":
      return text.replace(
        /([-_ ]\w)/g,
        (match) => match?.at(1)?.toUpperCase() ?? ""
      );
    case "pascal":
      return text.replace(/(^\w|[-_ ]\w)/g, (match) => match.toUpperCase());
    default:
      return text.toLowerCase();
  }
}
