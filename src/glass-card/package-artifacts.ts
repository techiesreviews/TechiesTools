import type { GlassCardCompilation } from "./compiler.ts";
import { packageTextFiles, type PackagedTextFiles } from "../shared/package-text-files.ts";

export const packageGlassCardArtifacts = (compilation: GlassCardCompilation): PackagedTextFiles => packageTextFiles(
  "glass-card.zip",
  [
    { name: "glass-card.css", value: compilation.css },
    { name: "glass-card.html", value: compilation.html },
    { name: "glass-card-standalone.html", value: compilation.standaloneHtml },
  ],
);
