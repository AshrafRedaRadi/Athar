/**
 * Chooses which كتاب شرح (in practice, which شيخ) an explanation belongs to.
 *
 * The previous free-text field guessed: it fuzzy-matched whatever was typed against every
 * existing book's name and author, in both directions, and created a new book when nothing
 * matched. Typing "شرح" could attach the explanation to an unrelated شيخ, and a typo forked
 * one scholar into two books — both silently, because the guess always produced *some* id.
 *
 * Picking from the list sends an explicit id, so no matching happens at all. Creating asks
 * for the name and the author separately rather than inferring them from one string.
 */
function ExplanationBookPicker({ value, books = [], onChange, compact = false }) {
  const { explanationBookId, scholarOrBook = "", newBookAuthor = "" } = value || {};
  const isCreating = !explanationBookId;

  const inputClass = compact
    ? "w-full px-2.5 py-1 rounded-lg border border-base-300 bg-base-100 text-[11px] font-2 text-base-content focus:outline-hidden focus:border-cyan-600"
    : "w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-xs font-2 text-base-content focus:outline-hidden focus:border-cyan-600";

  const handleSelect = (raw) => {
    if (raw === "__new__") {
      // Keep whatever was typed before so switching back and forth is not destructive.
      onChange({ explanationBookId: null, scholarOrBook, newBookAuthor });
      return;
    }
    const picked = books.find((b) => String(b.id) === raw);
    onChange({
      explanationBookId: picked ? picked.id : null,
      scholarOrBook: picked ? picked.name || "" : scholarOrBook,
      newBookAuthor: picked ? picked.author || "" : newBookAuthor,
    });
  };

  return (
    <div className="space-y-1.5">
      <select
        value={explanationBookId ? String(explanationBookId) : "__new__"}
        onChange={(e) => handleSelect(e.target.value)}
        className={inputClass}
        title="اختر الشيخ أو كتاب الشرح"
      >
        <option value="__new__">➕ شيخ / كتاب شرح جديد…</option>
        {books.map((book) => (
          <option key={book.id} value={String(book.id)}>
            {book.name}
            {book.author && book.author !== book.name ? ` — ${book.author}` : ""}
          </option>
        ))}
      </select>

      {isCreating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <input
            type="text"
            value={scholarOrBook}
            onChange={(e) =>
              onChange({ explanationBookId: null, scholarOrBook: e.target.value, newBookAuthor })
            }
            placeholder="اسم كتاب الشرح"
            className={inputClass}
          />
          <input
            type="text"
            value={newBookAuthor}
            onChange={(e) =>
              onChange({ explanationBookId: null, scholarOrBook, newBookAuthor: e.target.value })
            }
            placeholder="اسم الشيخ / المؤلف"
            className={inputClass}
          />
        </div>
      )}

      {books.length === 0 && (
        <p className="text-[10px] text-base-content/50 font-2">
          لا توجد كتب شرح محفوظة بعد — أول شرح تضيفه سيُنشئ واحداً.
        </p>
      )}
    </div>
  );
}

export default ExplanationBookPicker;
