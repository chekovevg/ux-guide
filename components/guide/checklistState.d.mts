type ChecklistStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function getChecklistStorageKey(
  locale: "ru" | "en",
  chapterSlug: string,
  blockId: string,
): string;

export function readChecklistState(
  storage: ChecklistStorage,
  key: string,
  itemCount: number,
): Set<number>;

export function toggleChecklistIndex(
  checked: ReadonlySet<number>,
  index: number,
  itemCount: number,
): Set<number>;

export function writeChecklistState(
  storage: ChecklistStorage,
  key: string,
  checked: ReadonlySet<number>,
): void;
