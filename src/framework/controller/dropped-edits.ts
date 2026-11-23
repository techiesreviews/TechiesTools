type RuleEdit = { elementId: string; ruleId: string; source: string };

/**
 * Element CSS edits that a failed CSS parser download dropped, latest per rule. Each edit
 * carries the rule's whole source, so replaying the latest one catches the rule up; a reset
 * forgets what it wiped, and export replays the rest before it hands anything out.
 */
export const createDroppedEdits = () => {
  const edits = new Map<string, RuleEdit>();
  const key = (elementId: string, ruleId: string) => JSON.stringify([elementId, ruleId]);
  return {
    keep: (edit: RuleEdit) => {
      const id = key(edit.elementId, edit.ruleId);
      edits.delete(id);
      edits.set(id, edit);
    },
    applied: (edit: RuleEdit) => { edits.delete(key(edit.elementId, edit.ruleId)); },
    forgetElements: (elementIds: Iterable<string>) => {
      const forgotten = new Set(elementIds);
      for (const [id, edit] of edits) if (forgotten.has(edit.elementId)) edits.delete(id);
    },
    clear: () => edits.clear(),
    any: () => edits.size > 0,
    sourceFor: (elementId: string, ruleId: string) => edits.get(key(elementId, ruleId))?.source,
    /** The kept edits, oldest first; applying one removes it. */
    pending: () => [...edits.values()],
  };
};
