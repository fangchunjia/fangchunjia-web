import { useStore } from "@nanostores/react";
import { PortableText } from "@portabletext/react";
import { useEffect, useState } from "react";
import { $activePos } from "~/stores/ui";

interface ProjectDescriptionProps {
  subtitle?: string | null;
  description: any;
}

export default function ProjectDescription({ project }: { project: ProjectDescriptionProps }) {
  const lineHeight = 22;
  const paragraphSpaceBefore = 0;
  const paragraphSpaceAfter = 0;
  const titlePos = useStore($activePos);
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewportHeight = window.innerHeight;

    if (titlePos) {
      const { top, left } = titlePos;
      const isLowerHalf = top > viewportHeight / 2;
      if (isLowerHalf) {
        setPos({
          bottom: viewportHeight - top + paragraphSpaceAfter,
          left: left,
        });
      } else {
        setPos({
          top: top + lineHeight + paragraphSpaceBefore,
          left: left,
        });
      }
    }
  }, []);

  return (
    <>
      {pos && (
        <div
          style={{
            ...(pos.top && { top: pos.top }),
            ...(pos.bottom && { bottom: pos.bottom }),
            left: pos.left,
          }}
          className="fixed w-[calc((100vw-2rem*2)/3)] z-10"
        >
          {project.subtitle && <h2>{project.subtitle}</h2>}
          <div className="prose prose-p:leading-[20px] [--tw-prose-body:#000000]">
            <PortableText value={project.description} />
          </div>
        </div>
      )}
    </>
  );
}
