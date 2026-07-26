export function join(segments: string[], connector = ""): string {
  return segments.filter(Boolean).join(connector);
}
