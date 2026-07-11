import { useLoaderData, data, Link } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/_layout.projects.$slug";
import { client } from "~/lib/sanity";
import { enrichCover } from "~/lib/mux";
import groq from "groq";
import MediaGrid from "~/components/MediaGrid";
import { PortableText } from "@portabletext/react";
import { $activePos, $activeProject, $coverPlayed } from "~/stores/ui";
import { motion, type Variants } from "motion/react";
import { useStore } from "@nanostores/react";
import type { Project } from "~/types/sanity.types";
import applyAccentColor from "~/utils/applyAccentColor";

// Shared entrance for the detail overlay UI (back, subtitle, description, scroll
// hint) so they all fade in together.
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1, duration: 0.4 } },
};

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
  const activePos = useStore($activePos);
  const coverPlayed = useStore($coverPlayed);
  const overlayState = coverPlayed ? "visible" : "hidden";

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
    <article>
      {/* Back button + subtitle — pinned to the borders at the held title's vertical
          position, fading in together with the description via overlayVariants. */}
      {/* {activePos && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate={overlayState}
          style={{ top: activePos.top }}
          className="fixed left-4 z-30 font-medium text-sm text-accent leading-[24px]"
        >
          <Link to="/projects">(back)</Link>
        </motion.div>
      )} */}
      {/* {activePos && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate={overlayState}
          style={{ top: activePos.top }}
          className="fixed right-8 z-30 font-medium text-sm text-accent leading-[24px] whitespace-nowrap pointer-events-none"
        >
          {project.subtitle}
        </motion.div>
      )} */}
      {/* Spacer — holds document flow and description overlay; Gallery cover shows through */}
      <motion.div
        className="w-full relative"
        initial={{ height: "100dvh" }}
        // animate={
        //   coverPlayed
        //     ? { height: "calc(100dvh - 32px)" }
        //     : { height: "100dvh" }
        // }
        transition={{ duration: 0.8, delay: 0.4, ease: [0.72, 0, 0.24, 1] }}
      >
        <section className="grid grid-cols-12 absolute inset-0 p-4 gap-4">
          <div className=" col-start-5 col-span-4 flex flex-col justify-end gap-4 text-accent">
            <motion.div
              className="flex flex-col gap-2 p-2"
              variants={overlayVariants}
              initial="hidden"
              animate={overlayState}
            >
              <motion.div
                drag
                dragMomentum={false}
                className="flex flex-col gap-2"
              >
                <div className="text-sm font-medium">
                  {project.description && (
                    <div className="leading-[16px]">
                      <PortableText value={project.description} />
                    </div>
                  )}
                </div>
              </motion.div>
              {project.grid?.length && (
                <div className="text-xs font-medium">(scroll down)</div>
              )}
            </motion.div>
          </div>
        </section>
      </motion.div>
      {/* Images section — follows cover in natural flow */}
      {project.grid?.length && (
        <section className="py-8 pl-[208px] bg-fangchunjia-gray">
          <MediaGrid grid={project.grid} />
        </section>
      )}
    </article>
  );
}
