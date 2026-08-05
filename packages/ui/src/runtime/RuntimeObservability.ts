import type { RuntimeEvent, RuntimeObserver } from './RuntimeObservability.types';

export function emitRuntimeEvent(observer: RuntimeObserver | undefined, event: RuntimeEvent): void {
  if (observer === undefined) {
    return;
  }

  try {
    observer.onRuntimeEvent(Object.freeze(event));
  } catch {
    // Observability must not change command or workspace behavior.
  }
}
