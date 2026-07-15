// app/routes/projects.tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_layout.projects._index";
import { client, coverImageUrl } from "~/lib/sanity";
import { enrichCover } from "~/lib/mux";
import groq from "groq";
import ProjectList from "~/components/ProjectList";
import { $activeProject, $hoveredProject } from "~/stores/ui";
import { useEffect } from "react";
import { preload } from "react-dom";
import type {
  Media,
  MuxVideo,
  MuxVideoAssetReference,
  Project,
} from "~/types/sanity.types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang (Projects)" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

// The GROQ query dereferences `video.asset` (asset->{ playbackId, "aspectRatio":
// data.aspect_ratio, ... }), but sanity-typegen models it as a plain reference.
// Reflect the dereferenced runtime shape here.
type MuxAssetDeref = {
  playbackId?: string;
  assetId?: string;
  status?: string;
  aspectRatio?: string;
  duration?: number;
};

// Cover media augmented in the loader with a blur `placeholder` and a
// CSS-ready `aspectRatio` so the player can reserve its box before load. The
// asset is intersected with MuxAssetDeref (not replaced) so EnrichedMedia stays
// mutually assignable with the generated `Media` type.
export type EnrichedMedia = Omit<Media, "video"> & {
  video?: Omit<MuxVideo, "asset"> & {
    asset?: MuxVideoAssetReference & MuxAssetDeref;
  };
  placeholder?: string;
  aspectRatio?: string;
};

export type ProjectInfo = Omit<
  Pick<
    Project,
    | "_id"
    | "category"
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
  cover: Omit<Project["cover"], "media"> & { media?: EnrichedMedia };
};

export async function loader({}: Route.LoaderArgs) {
  const raw = await client.fetch<any[]>(groq`
    *[_type == "project"] | order(category->orderRank asc, orderRank asc) {
      _id,
      title,
      subtitle,
      year,
      slug,
      category->{
        _id,
        title,
        slug
      },
      cover {
        fullscreen,
        media {
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
          alt
        }
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
  useEffect(() => {
    $activeProject.set(null);
    $hoveredProject.set(null);
  }, []);

  // Eagerly warm the browser cache for cover images at low priority, so a
  // cover appears instantly on hover without competing with critical paint.
  projects?.forEach((p) => {
    if (
      p.cover.media?.mediaType === "image" &&
      p.cover.media.image?.asset?._ref
    ) {
      preload(coverImageUrl(p.cover.media.image.asset._ref), {
        as: "image",
        fetchPriority: "low",
      });
    }
  });

  return (
    <div className="project-list relative">
      <article>
        <div className="pl-space-left pr-8 pt-space-top">
          <section className="">
            <div className="">
              <ProjectList projects={projects} />
              {/* <ProjectList projects={projects} />
              <ProjectList projects={projects} />
              <ProjectList projects={projects} /> */}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
