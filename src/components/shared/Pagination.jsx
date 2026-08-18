/**
 * Numbered pager with a range summary, matching the users-management footer.
 *
 * Page numbers are windowed rather than all rendered: a list that grows with use — the
 * activity feed gains a row on every action — would otherwise end up with dozens of
 * buttons wrapping across the panel.
 *
 * @param {number} page        current page, 1-based
 * @param {number} totalPages
 * @param {number} totalCount  total rows across all pages
 * @param {number} pageSize
 * @param {(page: number) => void} onChange
 * @param {string} itemNoun    what is being counted, e.g. "سجل" or "مستخدم"
 */
function Pagination({ page, totalPages, totalCount, pageSize, onChange, itemNoun = "عنصر" }) {
  if (!totalCount) return null;

  const firstOnPage = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastOnPage = Math.min(page * pageSize, totalCount);

  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-2 text-xs sm:text-sm text-base-content/70">
      <span className="font-bold text-center sm:text-right">
        عرض {firstOnPage} إلى {lastOnPage} من أصل {totalCount} {itemNoun}
      </span>

      {totalPages > 1 && (
        <div className="join flex items-center justify-center">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onChange(Math.max(page - 1, 1))}
            className="join-item btn btn-xs sm:btn-sm btn-outline rounded-r-lg"
            aria-label="الصفحة السابقة"
          >
            «
          </button>

          {buildPageWindow(page, totalPages).map((entry, index) =>
            entry === "gap" ? (
              <button
                key={`gap-${index}`}
                type="button"
                disabled
                className="join-item btn btn-xs sm:btn-sm btn-outline text-base-content/40 pointer-events-none"
              >
                …
              </button>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onChange(entry)}
                aria-current={page === entry ? "page" : undefined}
                className={`join-item btn btn-xs sm:btn-sm ${
                  page === entry
                    ? "bg-cyan-700 text-white border-transparent font-bold"
                    : "btn-outline text-base-content/80"
                }`}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onChange(Math.min(page + 1, totalPages))}
            className="join-item btn btn-xs sm:btn-sm btn-outline rounded-l-lg"
            aria-label="الصفحة التالية"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The page numbers worth showing: always the first and last, plus a small run around the
 * current page, with "gap" markers where numbers were skipped. Short lists are returned
 * whole, since a gap marker takes as much room as the number it replaces.
 */
function buildPageWindow(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);

  const ordered = [...pages].sort((a, b) => a - b);
  const withGaps = [];

  ordered.forEach((value, index) => {
    if (index > 0 && value - ordered[index - 1] > 1) withGaps.push("gap");
    withGaps.push(value);
  });

  return withGaps;
}

export default Pagination;
