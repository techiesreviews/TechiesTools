import { packageTextFiles } from "../shared/package-text-files.ts";
import type { PatternCompilation } from "./engine.ts";

export const patternArtifactFiles = (compilation: PatternCompilation) => [
  { name: `${compilation.state.exportName}.css`, value: compilation.css },
  { name: `${compilation.state.exportName}.html`, value: compilation.html },
] as const;

export const packagePatternArtifacts = (compilation: PatternCompilation) =>
  packageTextFiles(`${compilation.state.exportName}.zip`, patternArtifactFiles(compilation));
