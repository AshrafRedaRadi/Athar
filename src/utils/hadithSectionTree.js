/**
 * Hadith Section Tree — canonical model and operations.
 *
 * The backend models sections as a self-referencing tree of arbitrary depth: a section
 * carries a ParentSectionId, and hadiths may hang off any section or off the book itself.
 * That generality is deliberate, because hadith books are not arranged one way —
 * الأربعون النووية holds its أحاديث directly, عمدة الأحكام nests كتاب → باب → حديث, and
 * fiqh متون go كتاب → باب → فصل and deeper.
 *
 * This module is the single place that shape is expressed on the client. Rendering and
 * saving both consume it, so the two cannot drift the way they did when the form and the
 * save path each grouped sections their own way.
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

// Every type is offered at every level; the arrangement is the admin's to choose.
export const SECTION_TYPE_OPTIONS = [
  SECTION_TYPES.KITAB,
  SECTION_TYPES.MAQSAD,
  SECTION_TYPES.BAB,
  SECTION_TYPES.FASL,
  SECTION_TYPES.OTHER,
];

/**
 * Mirrors HadithSections:MaxDepth on the server, which rejects anything deeper. Kept in
 * step so the UI can disable the control instead of letting the save fail.
 */
export const MAX_SECTION_DEPTH = 5;

/**
 * Guidance only — the editor imposes none of these shapes. A book puts أحاديث directly
 * under itself, groups them into كتب / أبواب / فصول, or does both; the tree accepts all of
 * it, so these exist to show an admin how real books are usually arranged.
 */
export const STRUCTURE_EXAMPLES = [
  {
    label: "أحاديث مباشرة",
    examples: "الأربعين النووية، الأصول الثلاثة، البيقونية، تحفة الأطفال",
  },
  {
    label: "كتب وأبواب وأحاديث",
    examples: "عمدة الأحكام، بلوغ المرام، صحيح البخاري",
  },
  {
    label: "أبواب وفصول وفقرات",
    examples: "الفقه الميسر، الروض المربع، متون العقيدة",
  },
];

let localIdCounter = 0;

/** Client-side identity for nodes that do not exist on the server yet. */
function nextLocalId(prefix) {
  localIdCounter += 1;
  return `${prefix}-${Date.now()}-${localIdCounter}`;
}

// ── Factories ──

export function createEmptyFormSection(type = SECTION_TYPES.KITAB, order = 1) {
  return {
    _localId: nextLocalId("section"),
    id: null,
    name: "",
    type,
    order,
    children: [],
    hadiths: [],
  };
}

export function createEmptyFormHadith(order = 1) {
  return {
    _localId: nextLocalId("hadith"),
    id: null,
    title: "",
    hadithNumber: "",
    matnText: "",
    explanations: [
      {
        _localId: nextLocalId("explanation"),
        id: null,
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


// ── Tree construction ──

/**
 * Build the section tree from the flat lists the API returns.
 *
 * @param {Array} sections - flat sections (each with id, parentSectionId, order)
 * @param {Array} hadiths - flat hadiths (each with hadithSectionId, order)
 * @returns {{ roots: Array, unsectionedHadiths: Array, orphanedSections: Array }}
 *   `unsectionedHadiths` belong to the book directly; `orphanedSections` reference a
 *   parent that is missing from the input and are surfaced rather than dropped, since
 *   silently discarding them is how content used to disappear.
 */
export function buildTree(sections = [], hadiths = []) {
  const byId = new Map();
  for (const section of sections) {
    byId.set(section.id, {
      ...section,
      _localId: section._localId || nextLocalId("section"),
      children: [],
      hadiths: [],
    });
  }

  const roots = [];
  const orphanedSections = [];

  for (const node of byId.values()) {
    if (!node.parentSectionId) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(node.parentSectionId);
    if (parent) parent.children.push(node);
    else orphanedSections.push(node);
  }

  const unsectionedHadiths = [];
  for (const hadith of hadiths) {
    const target = hadith.hadithSectionId ? byId.get(hadith.hadithSectionId) : null;
    if (target) target.hadiths.push(hadith);
    else unsectionedHadiths.push(hadith);
  }

  const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
  const sortDeep = (nodes) => {
    nodes.sort(byOrder);
    for (const node of nodes) {
      node.hadiths.sort(byOrder);
      sortDeep(node.children);
    }
  };

  sortDeep(roots);
  unsectionedHadiths.sort(byOrder);

  return { roots, unsectionedHadiths, orphanedSections };
}

// ── Traversal ──

/** Depth-first list of `{ node, depth, parent }`, depth starting at 1 for roots. */
export function flattenTree(roots = []) {
  const flat = [];
  const walk = (nodes, depth, parent) => {
    for (const node of nodes) {
      flat.push({ node, depth, parent });
      walk(node.children || [], depth + 1, node);
    }
  };
  walk(roots, 1, null);
  return flat;
}

/** Depth of a node by local id, or 0 when it is not in the tree. */
export function findDepth(roots, localId) {
  const found = flattenTree(roots).find((entry) => entry.node._localId === localId);
  return found ? found.depth : 0;
}

/** Total hadiths on a node and everything beneath it. */
export function countHadiths(node) {
  const own = node.hadiths?.length || 0;
  return (node.children || []).reduce((sum, child) => sum + countHadiths(child), own);
}

// ── Immutable operations ──
// Each returns a new roots array, so React state updates stay predictable.

function mapNodes(nodes, transform) {
  return nodes
    .map((node) => transform({ ...node, children: mapNodes(node.children || [], transform) }))
    .filter(Boolean);
}

/** Apply `changes` to the node with this local id. */
export function updateNode(roots, localId, changes) {
  return mapNodes(roots, (node) =>
    node._localId === localId ? { ...node, ...changes } : node
  );
}

/** Remove a node and everything beneath it. Pass `null` parentLocalId for a root. */
export function removeNode(roots, localId) {
  return mapNodes(roots, (node) => (node._localId === localId ? null : node));
}

/** Append a child section under `parentLocalId`, or at the root when it is null. */
export function addChildSection(roots, parentLocalId, type = SECTION_TYPES.BAB) {
  if (!parentLocalId) {
    return [...roots, createEmptyFormSection(type, roots.length + 1)];
  }

  return mapNodes(roots, (node) => {
    if (node._localId !== parentLocalId) return node;
    const child = createEmptyFormSection(type, (node.children?.length || 0) + 1);
    return { ...node, children: [...(node.children || []), child] };
  });
}

/** Append a hadith to any node — every level accepts them, not just leaves. */
export function addHadith(roots, sectionLocalId) {
  return mapNodes(roots, (node) => {
    if (node._localId !== sectionLocalId) return node;
    const hadith = createEmptyFormHadith((node.hadiths?.length || 0) + 1);
    return { ...node, hadiths: [...(node.hadiths || []), hadith] };
  });
}

/** Apply `changes` to a hadith inside a given section. */
export function updateHadith(roots, sectionLocalId, hadithLocalId, changes) {
  return mapNodes(roots, (node) => {
    if (node._localId !== sectionLocalId) return node;
    return {
      ...node,
      hadiths: (node.hadiths || []).map((h) =>
        h._localId === hadithLocalId ? { ...h, ...changes } : h
      ),
    };
  });
}

/** Remove a hadith from a given section. */
export function removeHadith(roots, sectionLocalId, hadithLocalId) {
  return mapNodes(roots, (node) => {
    if (node._localId !== sectionLocalId) return node;
    return {
      ...node,
      hadiths: (node.hadiths || []).filter((h) => h._localId !== hadithLocalId),
    };
  });
}

/**
 * Re-parent a node. Refuses moves that would place a node inside its own subtree, which
 * the backend rejects as a cycle anyway.
 */
export function moveNode(roots, localId, newParentLocalId) {
  if (localId === newParentLocalId) return roots;

  const entry = flattenTree(roots).find((item) => item.node._localId === localId);
  if (!entry) return roots;

  const subtreeIds = new Set(
    flattenTree([entry.node]).map((item) => item.node._localId)
  );
  if (newParentLocalId && subtreeIds.has(newParentLocalId)) return roots;

  const detached = removeNode(roots, localId);
  const moved = { ...entry.node };

  if (!newParentLocalId) return [...detached, moved];

  return mapNodes(detached, (node) =>
    node._localId === newParentLocalId
      ? { ...node, children: [...(node.children || []), moved] }
      : node
  );
}

/** Renumber `order` to match array position at every level, before saving. */
export function normalizeOrders(roots = []) {
  return roots.map((node, index) => ({
    ...node,
    order: index + 1,
    hadiths: (node.hadiths || []).map((h, hIndex) => ({ ...h, order: hIndex + 1 })),
    children: normalizeOrders(node.children || []),
  }));
}
