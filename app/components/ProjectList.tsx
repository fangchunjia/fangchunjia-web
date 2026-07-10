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
import { useStore } from "@nanostores/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  type AnimationPlaybackControls,
} from "motion/react";
import useCursorDrift from "~/hooks/useCursorDrift";

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

  const hoveredProject = useStore($hoveredProject);

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
            <Link
              to={`/projects/${p.slug.current}`}
              className="cursor-pointer h-full col-span-10 grid grid-cols-subgrid relative group"
              onClick={() => handleProjectClick(p)}
            >
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
                <AnimatePresence>
                  {hoveredProject?._id === p._id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-[4px] h-6 absolute right-full flex"
                    >
                      <div className="m-auto text-[12px]">★</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  ref={(el) => {
                    if (el) projectListItemRefs.current.set(p.title, el);
                  }}
                  className="flex gap-2 font-medium text-md mb-0 py-0"
                >
                  <div className="w-fit">
                    <ProjectListTitle title={p.title} />
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ProjectListTitle({ title }: { title: string }) {
  // Per-item cursor-driven shadow offset, sprung for a gentle follow lag. Kept
  // local (its own instance, not the layout's) so the offset freezes on leave and
  // a fading-out title doesn't keep tracking the cursor.
  const { x: springX, y: springY, setFromCursor, reset } = useCursorDrift();
  // Shadow opacity; starts at 0 so the (blurred) shadow is fully hidden until
  // hovered, then faded back to 0 on leave. The colour follows the LIVE
  // var(--color-accent) (relative-color syntax sets its alpha from the animated
  // value), so even a fading-out shadow tracks the current accent, not a baked hex.
  const alpha = useMotionValue(0);
  const textShadow = useMotionTemplate`${springX}px ${springY}px 2px rgb(from var(--color-accent) r g b / ${alpha})`;
  // Origin the offsets are measured from, captured on enter.
  const origin = useRef<{ x: number; y: number } | null>(null);
  // The delayed fade-in doubles as the debounce: alpha only rises after 200ms,
  // so a quick enter/leave stops it before it starts and the shadow stays hidden.
  const reveal = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => () => reveal.current?.stop(), []);

  return (
    <motion.span
      style={{ textShadow }}
      className="block px-1 -ml-1 leading-[24px]"
      onMouseEnter={(e) => {
        origin.current = { x: e.clientX, y: e.clientY };
        reset();
        alpha.set(0);
        reveal.current = animate(alpha, 0.4, { delay: 0.2, duration: 0.15 });
      }}
      onMouseMove={(e) => {
        if (!origin.current) return;
        setFromCursor({ x: e.clientX, y: e.clientY }, origin.current);
      }}
      onMouseLeave={() => {
        // Clear origin so onMouseMove stops updating — the offset freezes at its
        // last value while the shadow fades out (no cursor tracking during fade).
        origin.current = null;
        reveal.current?.stop();
        animate(alpha, 0, { duration: 2.4, ease: "easeOut" });
      }}
    >
      {title}
    </motion.span>
  );
}
