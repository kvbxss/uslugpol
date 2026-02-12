type EventHandler = (payload: any) => void;

class EventBus {
  private handlers: Record<string, EventHandler[]> = {};

  publish(event: string, payload: any) {
    this.handlers[event]?.forEach((handler) => handler(payload));
  }

  subscribe(event: string, handler: EventHandler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }
}

export const eventBus = new EventBus();
