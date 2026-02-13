import type { EventName, EventPayloadMap } from "@repo/shared";

export interface DomainEventBus {
  publish<K extends EventName>(event: K, payload: EventPayloadMap[K]): Promise<void>;
  subscribe<K extends EventName>(
    event: K,
    handler: (payload: EventPayloadMap[K]) => void | Promise<void>,
  ): void;
}

let coreEventBus: DomainEventBus | null = null;

export function configureCoreEventBus(bus: DomainEventBus) {
  coreEventBus = bus;
}

export function getCoreEventBus() {
  if (!coreEventBus) {
    throw new Error("Core event bus is not configured.");
  }
  return coreEventBus;
}
