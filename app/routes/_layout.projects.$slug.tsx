import { useLoaderData, data } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/_layout.projects.$slug";
import { client, coverImageUrl } from "~/lib/sanity";
import { rootOrigin, seoMeta } from "~/lib/seo";
import { enrichCover } from "~/lib/mux";
import { projectDetailQuery } from "~/lib/queries";
import MediaGrid from "~/components/MediaGrid";
import { PortableText } from "@portabletext/react";
import { $activeProject } from "~/stores/ui";
import ReactLenis from "lenis/react";
import { useStore } from "@nanostores/react";
import type { MediaGridBlock, Project } from "~/types/sanity.types";
import type {
  EnrichedMedia,
  ProjectInfo,
} from "~/routes/_layout.projects._index";
import applyAccentColor from "~/utils/applyAccentColor";
import BackOverlay from "~/components/BackOverlay";
import MediaRenderer from "~/components/MediaRenderer";
import { getMediaAspectRatio } from "~/utils/getMediaAspectRatio";

// A media grid cell as returned by the loader: the generated MediaGridBlock plus
// its array `_key`, with `media` in the deref'd/enriched shape.
type GridMediaBlock = { _key: string } & Omit<MediaGridBlock, "media"> & {
    media?: EnrichedMedia;
  };

// Runtime shape of the slug loader's project: ProjectInfo (deref'd category +
// enriched cover) plus the detail-only fields this route fetches.
type ProjectDetail = ProjectInfo & {
  externalLink?: string;
  description?: Project["description"];
  grid?: GridMediaBlock[];
};

// Absolute social-card image from the cover: Sanity CDN URL for images, Mux
// thumbnail for videos. Both are already absolute, so no origin needed.
function coverOgImage(media?: EnrichedMedia): string | undefined {
  if (media?.mediaType === "image" && media.image?.asset?._ref)
    return coverImageUrl(media.image.asset._ref);
  if (media?.mediaType === "video" && media.video?.asset?.playbackId)
    return `https://image.mux.com/${media.video.asset.playbackId}/thumbnail.jpg`;
  return undefined;
}

export function meta({ loaderData, matches, location }: Route.MetaArgs) {
  const project = loaderData?.project;
  return seoMeta({
    title: project
      ? `Chunjia Fang (${project.title})`
      : "Chunjia Fang (Project)",
    description: project?.subtitle || "A project by Chunjia Fang.",
    origin: rootOrigin(matches),
    path: location.pathname,
    image: coverOgImage(project?.cover.media),
    type: "article",
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const project = await client.fetch<ProjectDetail>(projectDetailQuery, {
    slug: params.slug,
  });

  if (!project) {
    throw data("Project not found", { status: 404 });
  }
  project.cover = await enrichCover(project.cover);
  return { project };
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();
  const activeProject = useStore($activeProject);

  useEffect(() => {
    if (!activeProject) {
      $activeProject.set({
        _id: project._id,
        category: project.category,
        title: project.title,
        subtitle: project.subtitle,
        slug: project.slug,
        year: project.year,
        cover: project.cover,
        accentColor: project.accentColor,
      });
    }
    applyAccentColor(project.accentColor.hex as string);
    return () => {
      applyAccentColor(null);
    };
  }, []);

  return (
    <>
      <BackOverlay />
      <ReactLenis
        className="fixed inset-0 left-[300px] top-space-top bg-white/80 z-overlay-content h-100dvh overflow-y-auto overscroll-contain [container-type:size]"
        options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}
      >
        <article className="p-8">
          {/* Server-rendered document heading. Visually hidden — the project
              title is shown via the floating overlay in the projects layout —
              but present in SSR HTML for crawlers and assistive tech. */}
          <h1 className="sr-only">{project.title}</h1>
          <section className="">
            <h2 className="sr-only">Cover</h2>
            {/* Ratio-driven box bounded by both maxes: width fills, aspect-ratio
                  derives height, and max-height re-shrinks width when it binds. */}
            <div
              className="max-h-[50cqh] max-w-[50cqw]"
              style={{
                aspectRatio: getMediaAspectRatio(project.cover.media),
              }}
            >
              <MediaRenderer media={project.cover.media} fit="contain" />
            </div>
          </section>
          <section className="grid grid-cols-12 gap-4 mt-8">
            <h2 className="sr-only">Info</h2>
            {/* Ratio-driven box bounded by both maxes: width fills, aspect-ratio
                  derives height, and max-height re-shrinks width when it binds. */}
            <div className="col-start-1 col-span-12 font-medium text-accent leading-4">
              <div className="text-sm leading-5">
                <div>
                  <span>{project.year}</span>
                </div>
                {project.externalLink && (
                  <div>
                    <span>{project.externalLink}</span>
                  </div>
                )}
                {project.subtitle && (
                  <div>
                    <span>{project.subtitle}</span>
                  </div>
                )}
              </div>

              {project.description && (
                <div className="mt-4 text-md leading-5">
                  <PortableText value={project.description} />
                </div>
              )}
            </div>
          </section>
          {/* Images section — follows cover in natural flow */}
          {project.grid?.length && (
            <section className="mt-8">
              <h2 className="sr-only">Gallery</h2>
              <MediaGrid grid={project.grid} />
            </section>
          )}
        </article>
      </ReactLenis>
    </>
  );
}
