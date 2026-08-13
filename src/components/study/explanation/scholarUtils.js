/**
 * Helper utility to extract author name from explanation item
 */
export function getScholarAuthorName(item) {
  if (!item || typeof item !== "object") return "";
  return (item.author || item.Author || item.title || "").trim();
}
