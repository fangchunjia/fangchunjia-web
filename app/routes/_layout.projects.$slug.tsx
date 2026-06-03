import { useLoaderData, data } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/_layout.projects.$slug";
import { client } from "~/lib/sanity";
import groq from "groq";
import MediaGrid from "~/components/MediaGrid";
import ReactLenis, { useLenis } from "lenis/react";
import { PortableText } from "@portabletext/react";
import { $activeProject, $scrollY } from "~/stores/ui";
import { motion } from "motion/react";
import { useStore } from "@nanostores/react";
import type { Project } from "~/types/sanity.types";
import applyAccentColor from "~/utils/applyAccentColor";
import Back from "~/components/Back";

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
        mediaType,
        image { asset { _ref } },
        vimeoId
      },
      accentColor,
      description,
      labels[]-> { _id, title, slug },
      grid[] {
        _type,
        _key,
        colSpanMobile,
        colSpanTablet,
        colSpanDesktop,
        _type == "imageGridBlock" => {
          image,
          caption,
        },
        _type == "videoGridBlock" => {
          url,
          caption
        },
        _type == "audioGridBlock" => {
          url,
          caption
        },
        _type == "richTextGridBlock" => {
          content
        }
      }
    }
  `,
    { slug: params.slug },
  );

  if (!project) {
    throw data("Project not found", { status: 404 });
  }
  return { project };
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();
  const activeProject = useStore($activeProject);

  useEffect(() => {
    if (!activeProject) {
      $activeProject.set({
        _id: project._id,
        labels: project.labels,
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
  }, []);

  const lenis = useLenis(({ scroll }) => {
    $scrollY.set(scroll);
  });

  useEffect(() => {
    return () => {
      lenis?.scrollTo(0, { immediate: true });
    };
  }, [lenis]);

  const accentColor = project.accentColor?.hex;

  return (
    <article>
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}>
        {/* Spacer — holds document flow and description overlay; Gallery cover shows through */}
        <motion.div
          className="w-full relative"
          initial={{ height: "100dvh" }}
          animate={{ height: "calc(100dvh - 32px)" }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.72, 0, 0.24, 1] }}
        >
          <section className="grid grid-cols-3 absolute inset-0 p-4 gap-4">
            <div
              className="col-span-1 col-start-2 flex flex-col justify-end gap-4"
              style={{
                color: project.accentColor?.hex,
                textShadow: `0 0 1px ${project.accentColor?.hex}80`,
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 1,
                    duration: 0.4,
                  },
                }}
              >
                <motion.div
                  drag
                  dragMomentum={false}
                  className="flex flex-col gap-4"
                >
                  <div className="text-sm font-medium">
                    <div className="mb-4">{project.subtitle}</div>
                    <div className="leading-[16px]">
                      <PortableText value={project.description} />
                    </div>
                  </div>
                  <div className="text-xs font-medium">(scroll down)</div>
                </motion.div>
                <div className="fixed top-0 inset-x-auto">
                  <Back />
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>

        {/* Images section — follows cover in natural flow */}
        <section className="p-8 px-32" style={{ backgroundColor: "#e7e7e7" }}>
          <MediaGrid grid={project.grid} />
        </section>
      </ReactLenis>
    </article>
  );
}
