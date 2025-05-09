import { openDB } from "idb";

const DB_NAME = "UserSecurityDB";
const STORE_NAME = "pins";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export const setPIN = async (address, pin) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, pin, address);
};

export const getPIN = async (address) => {
  const db = await dbPromise;
  return db.get(STORE_NAME, address);
};
