import { useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  $activePos,
  $activeProject,
  $hoveredEl,
  $hoveredProject,
} from "~/stores/ui";
import type { ProjectInfo } from "~/routes/_layout.projects._index";
import applyAccentColor from "~/utils/applyAccentColor";

export default function ProjectList({ projects }: { projects: ProjectInfo[] }) {
  const committed = useRef<string | null>(null);

  const projectListItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const DEFAULT_ACCENT_COLOR = "#000";

  const handleProjectClick = (p: ProjectInfo) => {
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
    <ul className="relative">
      {projects.map((p, i) => {
        const isFirstOfCategory =
          i === 0 || projects[i - 1].category.title !== p.category.title;
        return (
          <li
            key={p.slug.current}
            className="grid grid-cols-12 gap-4 text-accent"
          >
            <div className="col-start-1 col-span-2 font-medium text-sm">
              {isFirstOfCategory ? `(${p.category.title})` : ""}
            </div>
            <div
              className="relative w-fit col-span-6"
              onMouseEnter={(e) => {
                $hoveredProject.set(p);
                $hoveredEl.set(e.currentTarget);
                applyAccentColor(p.accentColor.hex || null);
              }}
              onMouseLeave={(e) => {
                // When moving between adjacent items the next item's mouseenter
                // can fire before this leave; guard so a stale leave doesn't
                // clobber the hover that already took over.
                if ($hoveredEl.get() !== e.currentTarget) return;
                $hoveredProject.set(null);
                $hoveredEl.set(null);
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
                  <div className="w-fit">
                    <span className="block px-1 -ml-1 leading-[24px] ">
                      {p.title}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-start-9 col-span-4 font-medium text-sm w-full">
              <div className="w-fit ml-auto" data-subtitle>
                {p.subtitle}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
