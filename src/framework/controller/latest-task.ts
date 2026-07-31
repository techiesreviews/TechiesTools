export type LatestTaskScheduler<T> = {
  schedule(value: T): void;
  flush(): boolean;
};

export const createLatestTaskScheduler = <T, Handle>(
  apply: (value: T) => void,
  requestTask: (callback: () => void) => Handle,
  cancelTask: (handle: Handle) => void,
): LatestTaskScheduler<T> => {
  let pending = false;
  let generation = 0;
  let handle: Handle;
  let latest: T;

  return {
    schedule(value) {
      latest = value;
      if (pending) cancelTask(handle);
      pending = true;
      const scheduledGeneration = ++generation;
      handle = requestTask(() => {
        if (!pending || scheduledGeneration !== generation) return;
        pending = false;
        apply(latest);
      });
    },
    flush() {
      if (!pending) return false;
      cancelTask(handle);
      pending = false;
      generation += 1;
      apply(latest);
      return true;
    },
  };
};
