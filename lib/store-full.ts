/**
 * Thrown by a write that would take what the store keeps past a ceiling: its
 * record past MAX_STORE_BYTES (lib/catalog.ts, lib/store.ts), or its data room
 * (lib/store-data.ts, DataRoomError). Every studio route answers it the same
 * way, "store_full", with the sentence the form shows.
 */
export class StoreFullError extends Error {
  constructor(message = "store_full") {
    super(message);
  }
}
