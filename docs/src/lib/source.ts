import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { icons } from "lucide-react";
import { createElement } from "react";

import { docs } from "@/.source/server";

export const source = loader({
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }

    return null;
  },
  plugins: [lucideIconsPlugin()],
  source: docs.toFumadocsSource(),
});
