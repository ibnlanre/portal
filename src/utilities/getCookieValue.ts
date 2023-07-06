export function getCookieValue(name: string) {
  try {
    if (typeof document === "undefined") return null;
    const cookies = document?.cookie?.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies?.at(i)?.trim();
      if (cookie?.startsWith(name + "=")) {
        return cookie?.substring(name.length + 1);
      }
    }
  } catch (error) {
    console.error("Error retrieving Document Cookie", error);
  }
  return null;
}
