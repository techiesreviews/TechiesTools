/**
 * Runs Framework event handlers in arrival order once the controller has started.
 *
 * `begin()` starts the controller at once, or, when saved Element edits must be parsed
 * (`startNeedsParser`), after the CSS parser loads. Handlers that parse CSS also wait for
 * the parser. While anything waits, later events queue behind it, so none is lost or
 * handled out of order; with nothing waiting a handler runs synchronously, exactly as a
 * plain listener would. A failed start or parser download is reported, and the next
 * event tries again; Element edits carry their whole source, so a later edit catches up.
 */
export const createStartupQueue = (options: {
  start: () => void;
  startNeedsParser: boolean;
  loadParser: () => Promise<unknown>;
  parserLoaded: () => boolean;
  report?: (error: unknown) => void;
}) => {
  const report = options.report ?? ((error: unknown) => globalThis.reportError(error));
  let started = false;
  let pending = 0;
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = (work: () => unknown) => {
    pending += 1;
    queue = queue.then(work).catch(report).finally(() => { pending -= 1; });
  };
  // Started before `start()` runs, so events its first publish sets off are handled in line.
  const startNow = () => {
    started = true;
    try { options.start(); } catch (error) { started = false; throw error; }
  };
  const ensureStarted = async () => {
    if (started) return;
    if (options.startNeedsParser) await options.loadParser();
    startNow();
  };
  const afterStart = <E>(handler: (event: E) => void, needsParser = false) => (event: E) => {
    if (started && pending === 0 && (!needsParser || options.parserLoaded())) {
      handler(event);
      return;
    }
    enqueue(async () => {
      await ensureStarted();
      if (needsParser) await options.loadParser();
      handler(event);
    });
  };
  const begin = () => {
    if (options.startNeedsParser) enqueue(ensureStarted);
    else startNow();
  };
  return { afterStart, begin };
};
