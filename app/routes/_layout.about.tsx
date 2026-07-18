import { PortableText } from "@portabletext/react";
import { client } from "~/lib/sanity";
import { aboutQuery } from "~/lib/queries";
import { data, useLoaderData } from "react-router";
import type { About } from "../types/sanity.types";
import type { Route } from "./+types/_layout.about";
import { rootOrigin, seoMeta } from "~/lib/seo";

export function meta({ matches, location }: Route.MetaArgs) {
  return seoMeta({
    title: "Chunjia Fang (About)",
    description: "About Chunjia Fang - background, practice, and contact.",
    origin: rootOrigin(matches),
    path: location.pathname,
  });
}

export async function loader() {
  const about = await client.fetch<About>(aboutQuery);

  if (!about) {
    throw data("About not found", { status: 404 });
  }
  return { about };
}

export default function About() {
  const { about } = useLoaderData<typeof loader>();
  return (
    <div className="pl-space-left pr-8 pt-space-top w-full">
      <h1 className="sr-only">About</h1>
      <article className="">
        <div className="[--tw-prose-body:#000000] prose prose-p:font-medium prose-p:leading-[20px] prose-p:m-0 prose-p:empty:h-[20px] prose-a:font-medium prose-a:no-underline prose-a:text-fangchunjia-pink">
          <PortableText value={about.body} />
        </div>
      </article>
    </div>
  );
}
