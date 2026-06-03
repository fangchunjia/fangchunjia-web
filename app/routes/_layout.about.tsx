import { PortableText } from "@portabletext/react";
import { client } from "~/lib/sanity";
import groq from "groq";
import { data, useLoaderData } from "react-router";
import type { About } from "../types/sanity.types";
import { motion, type Variants } from "motion/react";
import type { Route } from "./+types/_layout.about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang (About)" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

export async function loader() {
  const about = await client.fetch<About>(
    groq`
    *[_type == "about"][0] {
      _id,
      body,
      }
  `,
  );

  if (!about) {
    throw data("About not found", { status: 404 });
  }
  return { about };
}

export default function About() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
    },
  };
  const { about } = useLoaderData<typeof loader>();
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.4, delay: 0.4 }}
      className="p-4 pt-28 w-full h-full"
    >
      <article className="w-132 pl-4">
        <div className="[--tw-prose-body:#000000] prose prose-p:font-medium prose-p:leading-[20px] prose-p:m-0 prose-p:empty:h-[20px] prose-a:font-medium prose-a:no-underline prose-a:text-fangchunjia-pink">
          <PortableText value={about.body} />
        </div>
      </article>
    </motion.div>
  );
}
