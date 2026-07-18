// app/routes/projects.tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_layout.projects._index";
import { client, coverImageUrl } from "~/lib/sanity";
import { enrichCover } from "~/lib/mux";
import { projectsQuery } from "~/lib/queries";
import ProjectList from "~/components/ProjectList";
import { $activeProject, $hoveredProject } from "~/stores/ui";
import { useEffect } from "react";
import { preload } from "react-dom";
import type {
  Media,
  MuxVideo,
  MuxVideoAssetReference,
  Project,
  Slug,
} from "~/types/sanity.types";
import Screen from "~/components/Screen";
import { useStore } from "@nanostores/react";
import { rootOrigin, seoMeta } from "~/lib/seo";

export function meta({ matches, location }: Route.MetaArgs) {
  return seoMeta({
    title: "Chunjia Fang (Projects)",
    description: "Selected projects and work by Chunjia Fang.",
    origin: rootOrigin(matches),
    path: location.pathname,
  });
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
export type EnrichedMedia = Omit<Media, "video" | "image"> & {
  // Image intrinsic `aspectRatio` (number) is projected in the loader from the
  // Sanity asset metadata: `asset->metadata.dimensions.aspectRatio`.
  image?: NonNullable<Media["image"]> & { aspectRatio?: number };
  video?: Omit<MuxVideo, "asset"> & {
    asset?: MuxVideoAssetReference & MuxAssetDeref;
  };
  placeholder?: string;
  aspectRatio?: string;
};

// The GROQ query dereferences `category->{ _id, title, slug }`, but typegen models
// it as a plain reference — reflect the dereferenced runtime shape here.
export type CategoryDeref = { _id: string; title: string; slug: Slug };

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
  >,
  "cover" | "category"
> & {
  category: CategoryDeref;
  cover: Omit<Project["cover"], "media" | "fullscreen"> & {
    media?: EnrichedMedia;
  };
};

export async function loader({}: Route.LoaderArgs) {
  const raw = await client.fetch<ProjectInfo[]>(projectsQuery);
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

  const hoveredProject = useStore($hoveredProject);
  const activeProject = useStore($activeProject);

  const onScreenProject = activeProject || hoveredProject || null;

  const displayItem = onScreenProject
    ? { slug: onScreenProject.slug, cover: onScreenProject.cover }
    : null;

  return (
    <div className="project-list isolate">
      <div className="fixed inset-0 z-screen">
        <Screen item={displayItem} />
      </div>
      <article className="relative z-content">
        <h1 className="sr-only">Projects</h1>
        <div className="pl-space-left pr-8 pt-space-top">
          <section className="">
            <div className="">
              <ProjectList projects={projects} />
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
