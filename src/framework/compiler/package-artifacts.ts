import type { FrameworkCompilation, PackagedArtifacts } from "./index.ts";
import { packageTextFiles } from "../../shared/package-text-files.ts";

/** Package exact cached artifact bytes without recompiling or adding timestamps. */
export const packageArtifacts = (artifacts: FrameworkCompilation["artifacts"]): PackagedArtifacts => {
  const ordered = [artifacts.tokens, artifacts.elements, artifacts.components, artifacts.context];
  if (ordered.some((channel) => !channel.available)) throw new Error("All four Framework artifacts must be available before packaging.");
  const packaged = packageTextFiles(
    "framework.zip",
    ordered.flatMap((channel) => channel.available ? [{ name: channel.value.name, value: channel.value.value }] : []),
  );
  return { name: "framework.zip", mimeType: packaged.mimeType, value: packaged.value };
};
