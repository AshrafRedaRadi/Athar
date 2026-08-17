import {
  HiChevronDown,
  HiChevronUp,
  HiTrash,
  HiOutlinePlus,
  HiOutlineFolderPlus,
} from "react-icons/hi2";
import {
  SECTION_TYPE_LABELS,
  SECTION_TYPE_OPTIONS,
  MAX_SECTION_DEPTH,
  countHadiths,
} from "../../utils/hadithSectionTree";

/**
 * Depth palette. Levels stay visually distinct for the first four, then hold steady —
 * nesting is not capped by how many colours exist, and indentation stops growing so a
 * deep branch cannot push the form off the side of the screen.
 */
const DEPTH_STYLES = [
  { border: "border-amber-500/30 dark:border-amber-700/30", head: "bg-amber-50/70 dark:bg-amber-950/30", badge: "bg-amber-600", accent: "text-amber-700 dark:text-amber-400" },
  { border: "border-cyan-600/25 dark:border-cyan-700/25", head: "bg-cyan-50/50 dark:bg-cyan-950/20", badge: "bg-cyan-600", accent: "text-cyan-700 dark:text-cyan-400" },
  { border: "border-violet-500/25 dark:border-violet-700/25", head: "bg-violet-50/50 dark:bg-violet-950/20", badge: "bg-violet-600", accent: "text-violet-700 dark:text-violet-400" },
  { border: "border-emerald-500/25 dark:border-emerald-700/25", head: "bg-emerald-50/50 dark:bg-emerald-950/20", badge: "bg-emerald-600", accent: "text-emerald-700 dark:text-emerald-400" },
  { border: "border-slate-400/25 dark:border-slate-600/25", head: "bg-slate-100/60 dark:bg-slate-900/40", badge: "bg-slate-600", accent: "text-slate-700 dark:text-slate-300" },
];

/**
 * One section, rendering itself and its children recursively.
 *
 * Every node accepts both hadiths and sub-sections, which is what lets a single component
 * express كتاب → حديث, كتاب → باب → حديث, and كتاب → فصل → باب → حديث without any of them
 * being a special case.
 *
 * Hadith bodies are supplied by `renderHadith` rather than built here, so this component
 * stays about tree shape and the caller keeps ownership of the hadith editor.
 */
function SectionNode({
  node,
  index,
  depth = 1,
  collapsedIds,
  onToggleCollapse,
  onNameChange,
  onTypeChange,
  onRemove,
  onAddChild,
  onAddHadith,
  onRemoveHadith,
  renderHadith,
}) {
  const style = DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length) - 1];
  const label = SECTION_TYPE_LABELS[node.type] || "قسم";
  const isCollapsed = collapsedIds.has(node._localId);
  const childCount = node.children?.length || 0;
  const hadithCount = node.hadiths?.length || 0;
  const totalHadiths = countHadiths(node);
  const canNestDeeper = depth < MAX_SECTION_DEPTH;

  return (
    <div className={`border-2 ${style.border} rounded-2xl overflow-hidden shadow-xs`}>
      <div className={`flex flex-wrap items-center gap-2 px-3.5 py-2.5 ${style.head} border-b ${style.border}`}>
        <span className={`badge ${style.badge} text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0`}>
          {label} {index + 1}
        </span>

        <select
          value={node.type}
          onChange={(e) => onTypeChange(node._localId, Number(e.target.value))}
          className="px-2 py-1 rounded-lg border border-base-300 bg-base-100 text-[11px] font-2 font-bold text-base-content focus:outline-hidden shrink-0"
          title="نوع القسم"
        >
          {SECTION_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {SECTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={node.name}
          onChange={(e) => onNameChange(node._localId, e.target.value)}
          placeholder={`اسم ال${label}`}
          className="flex-1 min-w-[8rem] px-3 py-1.5 rounded-xl border border-base-300 bg-base-100 text-sm font-2 font-bold text-base-content focus:outline-hidden shadow-xs"
        />

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] ${style.accent} font-2 hidden sm:inline`}>
            {childCount > 0 && `${childCount} قسم فرعي · `}
            {totalHadiths} عنصر
          </span>

          <button
            type="button"
            onClick={() => onToggleCollapse(node._localId)}
            className={`btn btn-ghost btn-xs rounded-lg ${style.accent}`}
            title={isCollapsed ? "توسيع" : "طي"}
          >
            {isCollapsed ? <HiChevronDown className="text-base" /> : <HiChevronUp className="text-base" />}
          </button>

          <button
            type="button"
            onClick={() => onRemove(node._localId)}
            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
            title={`حذف ال${label}`}
          >
            <HiTrash className="text-sm" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3">
          {node.hadiths?.map((hadith, hIdx) => (
            <div key={hadith._localId}>
              {renderHadith(node._localId, hadith, hIdx, () =>
                onRemoveHadith(node._localId, hadith._localId)
              )}
            </div>
          ))}

          {childCount > 0 && (
            <div className="space-y-3 ps-2 border-s-2 border-base-300/60">
              {node.children.map((child, cIdx) => (
                <SectionNode
                  key={child._localId}
                  node={child}
                  index={cIdx}
                  depth={depth + 1}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={onToggleCollapse}
                  onNameChange={onNameChange}
                  onTypeChange={onTypeChange}
                  onRemove={onRemove}
                  onAddChild={onAddChild}
                  onAddHadith={onAddHadith}
                  onRemoveHadith={onRemoveHadith}
                  renderHadith={renderHadith}
                />
              ))}
            </div>
          )}

          {hadithCount === 0 && childCount === 0 && (
            <p className="text-xs text-base-content/50 text-center py-3 font-2">
              لا يوجد محتوى بعد في هذا ال{label} — أضف حديثاً أو قسماً فرعياً
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onAddHadith(node._localId)}
              className="btn btn-xs sm:btn-sm btn-outline border-cyan-700/60 text-cyan-700 hover:bg-cyan-700 hover:text-white font-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <HiOutlinePlus className="text-sm" />
              <span>إضافة حديث أو فقرة لهذا ال{label}</span>
            </button>

            <button
              type="button"
              onClick={() => onAddChild(node._localId)}
              disabled={!canNestDeeper}
              className="btn btn-xs sm:btn-sm btn-outline border-amber-600/60 text-amber-700 hover:bg-amber-600 hover:text-white font-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              title={
                canNestDeeper
                  ? `إضافة قسم فرعي داخل هذا ال${label}`
                  : `لا يمكن تداخل الأقسام لأكثر من ${MAX_SECTION_DEPTH} مستويات`
              }
            >
              <HiOutlineFolderPlus className="text-sm" />
              <span>إضافة قسم فرعي</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionNode;
