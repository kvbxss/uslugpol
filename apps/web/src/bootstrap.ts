import { registerCarServiceHandlers } from "@repo/car-service";
import { configureCoreEventBus, registerCoreHandlers } from "@repo/core";
import { registerEventServiceHandlers } from "@repo/event-service";
import { eventBus } from "@repo/shared";

let initialized = false;

export function initializeModules() {
  if (initialized) {
    return;
  }

  configureCoreEventBus(eventBus);
  registerCoreHandlers();
  registerEventServiceHandlers();
  registerCarServiceHandlers();
  initialized = true;
}
