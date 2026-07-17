import { atom, computed } from "nanostores";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

// Owned by ProjectList (/projects), to keep track of the hovered project
export const $hoveredProject = atom<ProjectInfo | null>(null);

// Owned by ProjectList (/projects), the actual hovered list-item DOM element.
// Read live by the layout's mousemove handler to position the shadow title.
export const $hoveredEl = atom<HTMLElement | null>(null);

// Owned by ProjectList (/projects), to keep track of the clicked project.
// When it's different from $hoveredProject, it should have priority (activeProject || hoveredProject).
export const $activeProject = atom<ProjectInfo | null>(null);

// Derived: true whenever a project is being interacted with (clicked or hovered).
export const $isFlirtActivated = computed(
  [$activeProject, $hoveredProject],
  (active, hovered) => active !== null || hovered !== null,
);

// Owned by ProjectList (/projects), to keep track of the clicked position
export const $activePos = atom<{ top: number; left: number } | null>(null);

// Owned by Flirt: the live FlirtGraphic <svg> node. Read by Cover at exit to
// measure its rect so the exiting video can be masked to the exact Flirt shape.
export const $flirtEl = atom<SVGSVGElement | null>(null);
