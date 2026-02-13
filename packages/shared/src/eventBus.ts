import type { EventName, EventPayloadMap } from "./events";

class EventBus {
  private handlers: {
    [K in EventName]?: Array<(payload: EventPayloadMap[K]) => void | Promise<void>>;
  } = {};

  async publish<K extends EventName>(event: K, payload: EventPayloadMap[K]) {
    const handlers = this.handlers[event] ?? [];
    await Promise.allSettled(handlers.map((handler) => handler(payload)));
  }

  subscribe<K extends EventName>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void | Promise<void>,
  ) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
}

export const eventBus = new EventBus();
