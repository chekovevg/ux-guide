export function getChecklistStorageKey(locale, chapterSlug, blockId) {
  return `wynde-guide-checklist:v1:${locale}:${chapterSlug}:${blockId}`;
}

export function readChecklistState(storage, key, itemCount) {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "null");
    if (parsed?.version !== 1 || !Array.isArray(parsed.checked)) return new Set();
    return new Set(
      parsed.checked.filter(
        (index) =>
          Number.isInteger(index) && index >= 0 && index < itemCount,
      ),
    );
  } catch {
    return new Set();
  }
}

export function toggleChecklistIndex(checked, index, itemCount) {
  const next = new Set(checked);

  if (!Number.isInteger(index) || index < 0 || index >= itemCount) {
    return next;
  }

  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }

  return next;
}

export function writeChecklistState(storage, key, checked) {
  try {
    if (checked.size === 0) {
      storage.removeItem(key);
      return;
    }

    storage.setItem(
      key,
      JSON.stringify({ version: 1, checked: [...checked] }),
    );
  } catch {
    // Persistence is optional; the checklist remains usable in memory.
  }
}
