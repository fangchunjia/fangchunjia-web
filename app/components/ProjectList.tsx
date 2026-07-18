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
    const el = projectListItemRefs.current.get(p.slug.current);
    if (el) {
      const rect = el.getBoundingClientRect();
      $activePos.set({ top: rect.top, left: rect.left });
    }
    committed.current = p.accentColor.hex || DEFAULT_ACCENT_COLOR;
    applyAccentColor(p.accentColor.hex || DEFAULT_ACCENT_COLOR);
  };

  useEffect(() => {
    applyAccentColor(DEFAULT_ACCENT_COLOR);
  }, []);

  return (
    <ul className="flex flex-col">
      {projects.map((p) => (
        <li key={p.slug.current} className="w-fit">
          <Link
            to={`/projects/${p.slug.current}`}
            className="text-accent"
            onClick={() => handleProjectClick(p)}
          >
            <div
              onMouseMove={(e) => {
                $hoveredProject.set(p);
                $hoveredEl.set(e.currentTarget);
                applyAccentColor(p.accentColor.hex || DEFAULT_ACCENT_COLOR);
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
              <div
                ref={(el) => {
                  const key = p.slug.current;
                  if (el) projectListItemRefs.current.set(key, el);
                  else projectListItemRefs.current.delete(key);
                }}
                className="font-medium"
              >
                <ProjectListTitle title={p.title} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjectListTitle({ title }: { title: string }) {
  return <span className="block text-lg leading-6">{title}</span>;
}
