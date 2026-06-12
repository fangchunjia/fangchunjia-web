import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { $activePos, $activeProject, $hoveredProject } from "~/stores/ui";
import { useStore } from "@nanostores/react";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import applyAccentColor from "~/utils/applyAccentColor";
import recordTransitionScroll from "~/utils/recordTransitionScroll";

export default function ProjectList({ projects }: { projects: ProjectInfo[] }) {
  const committed = useRef<string | null>(null);
  const hoveredProject = useStore($hoveredProject);

  const projectListItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const DEFAULT_ACCENT_COLOR = "#000";

  const handleProjectClick = (p: ProjectInfo) => {
    recordTransitionScroll();
    $activeProject.set(p);
    const el = projectListItemRefs.current.get(p.title);
    if (el) {
      const rect = el.getBoundingClientRect();
      $activePos.set({ top: rect.top, left: rect.left });
    }
    committed.current = p.accentColor?.hex || DEFAULT_ACCENT_COLOR;
    applyAccentColor(p.accentColor?.hex || DEFAULT_ACCENT_COLOR);
  };

  useEffect(() => {
    applyAccentColor(DEFAULT_ACCENT_COLOR);
  }, []);

  return (
    <ul className="project-list relative">
      {projects.map((p) => (
        <li key={p.slug.current}>
          <div
            className="relative group w-fit"
            onMouseEnter={() => {
              $hoveredProject.set(p);
              applyAccentColor(p.accentColor.hex || null);
            }}
            onMouseLeave={() => {
              $hoveredProject.set(null);
              applyAccentColor(committed.current);
            }}
          >
            <Link
              to={`/projects/${p.slug.current}`}
              viewTransition
              className="cursor-pointer h-full w-fit block relative z-10"
              onClick={() => handleProjectClick(p)}
            >
              <div
                ref={(el) => {
                  if (el) projectListItemRefs.current.set(p.title, el);
                }}
                className="flex gap-2 font-medium mb-0 py-0 text-md"
              >
                <div
                  className="w-fit opacity-60 group-hover:opacity-100 transition text-accent"
                  style={{
                    opacity:
                      hoveredProject === null ||
                      p.slug.current === hoveredProject?.slug?.current
                        ? "1"
                        : "0.6",
                  }}
                >
                  <span className="block px-1 -ml-1 leading-[22px] ">
                    {p.title}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
