export function isExactChapterRootDestination(href, expectedPathname) {
  try {
    const url = new URL(href, "http://localhost");
    return url.pathname === expectedPathname && url.hash === "";
  } catch {
    return false;
  }
}

export function classifyBrowserExecutable(executablePath, pathExists) {
  return pathExists(executablePath) ? "available" : "unavailable";
}

export async function launchBrowserIfAvailable(
  browserType,
  pathExists,
  launchOptions = { headless: true },
) {
  const availability = classifyBrowserExecutable(
    browserType.executablePath(),
    pathExists,
  );

  if (availability === "unavailable") {
    return null;
  }

  return browserType.launch(launchOptions);
}
