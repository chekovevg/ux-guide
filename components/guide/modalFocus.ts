type FocusRestoreTarget = Pick<
  HTMLElement,
  "getClientRects" | "hidden" | "isConnected"
>;

function isVisibleConnectedTarget(target: FocusRestoreTarget | null) {
  return Boolean(
    target?.isConnected &&
      !target.hidden &&
      target.getClientRects().length > 0,
  );
}

export function getFocusRestoreTarget<T extends FocusRestoreTarget>(
  original: T | null,
  equivalents: Iterable<T>,
): T | null {
  if (isVisibleConnectedTarget(original)) {
    return original;
  }

  for (const equivalent of equivalents) {
    if (isVisibleConnectedTarget(equivalent)) {
      return equivalent;
    }
  }

  return null;
}
