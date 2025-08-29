import { atom } from "../atom";
import { createPrimitiveStore } from "../create-primitive-store";

const preferences = createPrimitiveStore(
  atom<{ language: string; theme: string }>({
    theme: "dark",
  })
);

preferences.$set({ language: "en" });
preferences.$get().language;
