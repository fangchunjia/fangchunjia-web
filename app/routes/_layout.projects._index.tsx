// app/routes/projects.tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_layout.projects._index";
import { client, coverImageUrl } from "~/lib/sanity";
import { enrichCover } from "~/lib/mux";
import groq from "groq";
import ProjectList from "~/components/ProjectList";
import { $activeProject, $hoveredProject } from "~/stores/ui";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import ReactLenis from "lenis/react";
import type { Project } from "~/types/sanity.types";
import PageEntrance from "~/components/PageEntrance";
import { useLenisAutoResize } from "~/utils/useLenisAutoResize";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang (Projects)" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

export type ProjectInfo = Omit<
  Pick<
    Project,
    | "_id"
    | "labels"
    | "title"
    | "subtitle"
    | "slug"
    | "year"
    | "cover"
    | "accentColor"
    | "lightDark"
  >,
  "cover"
> & {
  cover: Project["cover"] & { placeholder?: string; aspectRatio?: string };
};

export async function loader({}: Route.LoaderArgs) {
  const raw = await client.fetch<any[]>(groq`
    *[_type == "project"] | order(orderRank) {
      _id,
      title,
      subtitle,
      year,
      slug,
      cover {
        fullscreen,
        mediaType,
        video {
          asset->{
            playbackId,
            assetId,
            status,
            "aspectRatio": data.aspect_ratio,
            "duration": data.duration
          }
        },
        image,
      },
      accentColor,
      lightDark,
      labels[]-> { _id, title, slug }
    }
  `);
  const projects: ProjectInfo[] = await Promise.all(
    raw.map(async (p) => ({ ...p, cover: await enrichCover(p.cover) })),
  );
  return { projects };
}

export default function Projects() {
  const { projects } = useLoaderData<typeof loader>();
  const contentRef = useRef<HTMLElement>(null);
  useLenisAutoResize(contentRef);
  useEffect(() => {
    $activeProject.set(null);
    $hoveredProject.set(null);
  }, []);

  // Eagerly warm the browser cache for cover images at low priority, so a
  // cover appears instantly on hover without competing with critical paint.
  projects?.forEach((p) => {
    if (p.cover.mediaType === "image" && p.cover.image?.asset?._ref) {
      preload(coverImageUrl(p.cover.image.asset._ref), {
        as: "image",
        fetchPriority: "low",
      });
    }
  });

  return (
    <PageEntrance className="project-list relative">
      <article ref={contentRef}>
        <ReactLenis
          root
          options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}
        >
          <div className="p-4 pt-28">
            <section className="">
              <div className="pl-4">
                <ProjectList projects={projects} />
                <ProjectList projects={projects} />
                <ProjectList projects={projects} />
                <ProjectList projects={projects} />
              </div>
            </section>
          </div>
        </ReactLenis>
      </article>
    </PageEntrance>
  );
}
