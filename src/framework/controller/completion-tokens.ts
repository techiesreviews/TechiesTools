import { primitiveTokensFromSnapshot, type PrimitiveSnapshot, type PrimitiveToken } from "../compiler/index.ts";

/** Current Primitive editor data remains available to completion while invalid CSS drafts retain the last valid compilation. */
export const completionTokensFor = (snapshot: PrimitiveSnapshot, fallback: readonly PrimitiveToken[]) => {
  const current = primitiveTokensFromSnapshot(snapshot);
  return current.length ? current : fallback;
};
