import { atom } from "nanostores";
import type { ProjectInfo } from "~/routes/_layout.projects._index";

// Owned by ProjectList (/projects), to keep track of the hovered project
export const $hoveredProject = atom<ProjectInfo | null>(null);

// Owned by ProjectList (/projects), to keep track of the clicked project.
// When it's different from $hoveredProject, it should have priority (activeProject || hoveredProject).
export const $activeProject = atom<ProjectInfo | null>(null);

// Owned by ProjectList (/projects), to keep track of the clicked position
export const $activePos = atom<{ top: number; left: number } | null>(null);

// Owned by /projects/$slug
export const $scrollY = atom<number>(0);

// Owned by Cover. Flips to true when the splash cover has finished playing,
// so route entrance animations can wait until the splash is done.
export const $coverPlayed = atom<boolean>(false);
