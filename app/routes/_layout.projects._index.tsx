// app/routes/projects.tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_layout.projects._index";
import { client, urlFor } from "~/lib/sanity";
import groq from "groq";
import ProjectList from "~/components/ProjectList";
import { $activeProject, $hoveredProject } from "~/stores/ui";
import { useEffect } from "react";
import ReactLenis from "lenis/react";
import type { Project } from "~/types/sanity.types";
import PageEntrance from "~/components/PageEntrance";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang (Projects)" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

export type ProjectInfo = Pick<
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
>;

export async function loader({}: Route.LoaderArgs) {
  const raw = await client.fetch<any[]>(groq`
    *[_type == "project"] | order(year desc) {
      _id,
      title,
      subtitle,
      year,
      slug,
      cover {
        mediaType,
        video {
          asset->{
            playbackId,
            assetId,
            status,
            // optional, useful for posters/layout:
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
  const projects: ProjectInfo[] = raw.map((p) => ({
    ...p,
  }));
  return { projects };
}

export default function Projects() {
  const { projects } = useLoaderData<typeof loader>();
  useEffect(() => {
    $activeProject.set(null);
    $hoveredProject.set(null);
  }, []);

  return (
    <PageEntrance className="project-list relative">
      {/* Eager load cover images */}
      {projects?.map((p) =>
        p.cover.mediaType === "image" && p.cover.image?.asset?._ref ? (
          <link
            key={p._id}
            rel="prefetch"
            as="image"
            href={urlFor(p.cover.image.asset._ref).url()}
          />
        ) : null,
      )}
      <article className="grid grid-cols-12 p-4 pt-28 gap-4">
        <ReactLenis
          root
          options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}
        >
          <div className="col-start-1 col-span-4">
            <section className="bg-[#e7e7e7]">
              <ProjectList projects={projects} />
            </section>
          </div>
        </ReactLenis>
      </article>
    </PageEntrance>
  );
}
