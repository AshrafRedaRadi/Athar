/**
 * Hadith Section Tree Utilities & Constants
 * Provides structure modes, section type enums, and tree-building helpers
 * for the hierarchical content management system.
 */

// ── Section Types (matching Backend schema) ──
export const SECTION_TYPES = {
  KITAB: 1,   // كتاب
  MAQSAD: 2,  // مقصد
  FASL: 3,    // فصل
  BAB: 4,     // باب
  OTHER: 99,  // قسم / أخرى
};

// Arabic labels for section types
export const SECTION_TYPE_LABELS = {
  [SECTION_TYPES.KITAB]: "كتاب",
  [SECTION_TYPES.MAQSAD]: "مقصد",
  [SECTION_TYPES.FASL]: "فصل",
  [SECTION_TYPES.BAB]: "باب",
  [SECTION_TYPES.OTHER]: "قسم",
};

// ── Book Structure Modes ──
export const BOOK_STRUCTURE_MODES = {
  DIRECT: "direct",         // النمط 1: أحاديث / فقرات مباشرة
  KITAB_BAB: "kitab_bab",   // النمط 2: كتب -> أبواب -> أحاديث
  BAB_FASL: "bab_fasl",     // النمط 3: أبواب -> فصول -> فقرات
};

// Structure mode metadata for UI display
export const STRUCTURE_MODE_CONFIG = {
  [BOOK_STRUCTURE_MODES.DIRECT]: {
    label: "أحاديث / فقرات مباشرة",
    description: "المتون القصيرة ذات الأحاديث أو الفقرات المتتالية بدون تقسيمات فرعية",
    examples: "الأربعين النووية، الأصول الثلاثة، البيقونية، تحفة الأطفال",
    icon: "📄",
    levels: [],
  },
  [BOOK_STRUCTURE_MODES.KITAB_BAB]: {
    label: "كتب وأبواب وأحاديث",
    description: "كتب كبرى مقسمة إلى كتب فرعية، وكل كتاب يحتوي على أبواب وأحاديث",
    examples: "عمدة الأحكام، بلوغ المرام، صحيح البخاري",
    icon: "📚",
    levels: [
      { type: SECTION_TYPES.KITAB, label: "كتاب", plural: "كتب" },
      { type: SECTION_TYPES.BAB, label: "باب", plural: "أبواب" },
    ],
  },
  [BOOK_STRUCTURE_MODES.BAB_FASL]: {
    label: "أبواب وفصول وفقرات",
    description: "كتب فقهية أو عقدية مقسمة إلى أبواب ، وكل باب يحتوي على فصول وفقرات",
    examples: "الفقه الميسر، الروض المربع، متون العقيدة",
    icon: "📖",
    levels: [
      { type: SECTION_TYPES.BAB, label: "باب", plural: "أبواب" },
      { type: SECTION_TYPES.FASL, label: "فصل", plural: "فصول" },
    ],
  },
};

/**
 * Build a 2-level tree from flat sections array for KITAB_BAB or BAB_FASL modes.
 * @param {Array} sections - Flat array of sections from API
 * @param {Array} hadiths - Flat array of hadiths from API
 * @returns {{ rootSections: Array, unsectionedHadiths: Array }}
 */
export function buildTwoLevelTree(sections = [], hadiths = []) {
  // Separate root sections (parentSectionId is null) and child sections
  const rootSections = [];
  const childSectionsMap = {}; // parentSectionId -> [children]

  sections.forEach((sec) => {
    if (!sec.parentSectionId) {
      rootSections.push({ ...sec, children: [], hadiths: [] });
    } else {
      if (!childSectionsMap[sec.parentSectionId]) {
        childSectionsMap[sec.parentSectionId] = [];
      }
      childSectionsMap[sec.parentSectionId].push({ ...sec, hadiths: [] });
    }
  });

  // Sort root sections by order
  rootSections.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Attach children to root sections & sort them
  rootSections.forEach((root) => {
    root.children = (childSectionsMap[root.id] || []).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  });

  // Map hadiths to their sections
  const hadithsBySectionId = {};
  const unsectionedHadiths = [];

  hadiths.forEach((h) => {
    if (h.hadithSectionId) {
      if (!hadithsBySectionId[h.hadithSectionId]) {
        hadithsBySectionId[h.hadithSectionId] = [];
      }
      hadithsBySectionId[h.hadithSectionId].push(h);
    } else {
      unsectionedHadiths.push(h);
    }
  });

  // Attach hadiths to leaf sections (children) or root if no children
  rootSections.forEach((root) => {
    if (root.children.length > 0) {
      root.children.forEach((child) => {
        child.hadiths = (hadithsBySectionId[child.id] || []).sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
      });
    }
    // Also attach hadiths directly to root if they reference it
    root.hadiths = (hadithsBySectionId[root.id] || []).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  });

  return { rootSections, unsectionedHadiths };
}

/**
 * Create an empty root section object for local form state.
 * @param {number} type - Section type (KITAB, BAB, etc.)
 * @param {number} order - Display order
 * @returns {Object} Empty section for form
 */
export function createEmptyFormSection(type, order = 1) {
  return {
    _localId: Date.now() + Math.random(),
    name: "",
    type,
    order,
    children: [],
    hadiths: [],
  };
}

/**
 * Create an empty hadith/paragraph object for local form state.
 * @param {number} order - Display order
 * @returns {Object} Empty hadith for form
 */
export function createEmptyFormHadith(order = 1) {
  return {
    _localId: Date.now() + Math.random(),
    title: "",
    matnText: "",
    explanations: [
      {
        _localId: Date.now() + Math.random() + 1,
        scholarOrBook: "",
        text: "",
      },
    ],
    keyTerms: [],
    videoUrl: "",
    audioFile: null,
    audioFileName: "",
    order,
  };
}
