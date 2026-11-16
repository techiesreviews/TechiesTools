type RuleEdit = { elementId: string; ruleId: string; source: string };

/**
 * Element CSS edits that a failed CSS parser download dropped, latest per rule. Each edit
 * carries the rule's whole source, so replaying the latest one catches the rule up; a reset
 * forgets what it wiped, and export replays the rest before it hands anything out.
 */
export const createDroppedEdits = () => {
  const edits = new Map<string, RuleEdit>();
  const key = (edit: RuleEdit) => JSON.stringify([edit.elementId, edit.ruleId]);
  return {
    keep: (edit: RuleEdit) => { edits.delete(key(edit)); edits.set(key(edit), edit); },
    applied: (edit: RuleEdit) => { edits.delete(key(edit)); },
    forgetElements: (elementIds: Iterable<string>) => {
      const forgotten = new Set(elementIds);
      for (const [id, edit] of edits) if (forgotten.has(edit.elementId)) edits.delete(id);
    },
    clear: () => edits.clear(),
    any: () => edits.size > 0,
    /** The kept edits, oldest first; applying one removes it. */
    pending: () => [...edits.values()],
  };
};
