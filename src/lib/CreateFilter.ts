export function createFilter(currentUrl: URL, category: string) {
  const url = new URL(currentUrl);

  if (category === "todos") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", category);
  }

  return url.toString();
}
