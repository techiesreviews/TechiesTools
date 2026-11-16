/**
 * Runs event handlers in arrival order once the Framework controller has started.
 *
 * The controller starts at once, or after the CSS parser loads when saved Element
 * edits must be parsed (`starting` is then that promise). Handlers that parse CSS
 * also wait for the parser. While anything waits, later events queue behind it, so
 * no event is lost or handled out of order; with nothing waiting a handler runs
 * synchronously, exactly as a plain listener would.
 */
export const createStartupQueue = (options: {
  starting: Promise<unknown> | null;
  loadParser: () => Promise<unknown>;
  parserLoaded: () => boolean;
  report?: (error: unknown) => void;
}) => {
  const report = options.report ?? ((error: unknown) => globalThis.reportError(error));
  let started = options.starting === null;
  let pending = 0;
  let queue: Promise<unknown> = options.starting
    ? options.starting.then(() => { started = true; })
    : Promise.resolve();
  if (options.starting) {
    pending += 1;
    queue = queue.catch(report).finally(() => { pending -= 1; });
  }
  return <E>(handler: (event: E) => void, needsParser = false) => (event: E) => {
    if (started && pending === 0 && (!needsParser || options.parserLoaded())) {
      handler(event);
      return;
    }
    pending += 1;
    queue = queue
      .then(() => (needsParser ? options.loadParser() : undefined))
      .then(() => {
        if (started) handler(event);
      })
      .catch(report)
      .finally(() => { pending -= 1; });
  };
};
