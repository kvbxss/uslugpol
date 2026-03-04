export function buildDashboardHref(
  basePath: string,
  navigationQuery?: string,
  extraParams?: Record<string, string | undefined>,
) {
  const query = new URLSearchParams(navigationQuery ?? "");
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) {
      query.set(key, value);
      continue;
    }
    query.delete(key);
  }
  const parsed = query.toString();
  return parsed ? `${basePath}?${parsed}` : basePath;
}
