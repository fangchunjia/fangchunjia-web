import { useLoaderData, data } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/_layout.projects.$slug";
import { client } from "~/lib/sanity";
import { enrichCover } from "~/lib/mux";
import groq from "groq";
import MediaGrid from "~/components/MediaGrid";
import { PortableText } from "@portabletext/react";
import { $activeProject } from "~/stores/ui";
import ReactLenis from "lenis/react";
import { useStore } from "@nanostores/react";
import type { Project } from "~/types/sanity.types";
import applyAccentColor from "~/utils/applyAccentColor";
import BackOverlay from "~/components/BackOverlay";
import MediaRenderer from "~/components/MediaRenderer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang (Project)" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const project = await client.fetch<Project>(
    groq`
    *[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      year,
      slug,
      externalLink,
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
      description,
      labels[]-> { _id, title, slug },
      grid[] {
        _type,
        _key,
        gridColumnStart,
        gridColumnSpan,
        gridRowStart,
        _type == "mediaGridBlock" => {
          media {
            mediaType,
            image,
            alt,
            video {
              asset->{
                playbackId,
                assetId,
                status,
                "aspectRatio": data.aspect_ratio,
                "duration": data.duration
              }
            }
          }
        },
        _type == "richTextGridBlock" => {
          body
        }
      }
    }
  `,
    { slug: params.slug },
  );

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
        cover: project.cover as any,
        accentColor: project.accentColor,
        lightDark: project.lightDark,
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
        className="fixed inset-0 left-[300px] top-space-top bg-white/80 z-999 h-100dvh overflow-y-auto overscroll-contain"
        options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}
      >
        <article>
          <div className="w-full relative">
            <section className="[height:80dvh] flex">
              <div className="max-w-2/3 [height:80%] m-auto">
                <MediaRenderer media={project.cover.media} />
              </div>
            </section>
            <section className="grid grid-cols-12 p-4 gap-4">
              <div className=" col-start-5 col-span-4 flex flex-col justify-end gap-4 text-accent">
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium">
                      {project.description && (
                        <div className="leading-[16px]">
                          <PortableText value={project.description} />
                        </div>
                      )}
                    </div>
                  </div>
                  {project.grid?.length && (
                    <div className="text-xs font-medium">(scroll down)</div>
                  )}
                </div>
              </div>
            </section>
          </div>
          {/* Images section — follows cover in natural flow */}
          {project.grid?.length && (
            <section className="py-8">
              <MediaGrid grid={project.grid} />
            </section>
          )}
        </article>
      </ReactLenis>
    </>
  );
}
