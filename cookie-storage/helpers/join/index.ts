export function join(segments: string[], connector: string = ""): string {
  return segments.filter(Boolean).join(connector);
}
