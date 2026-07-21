import MediaGrid from "~/components/MediaGrid";
import type { Route } from "./+types/_layout._index";
import { rootOrigin, seoMeta } from "~/lib/seo";
import { homeQuery } from "~/lib/queries";
import { client } from "~/lib/sanity";
import { useLoaderData } from "react-router";
import type { Home } from "~/types/sanity.types";
import { getMediaAspectRatio } from "~/utils/getMediaAspectRatio";
import MediaRenderer from "~/components/MediaRenderer";

export function meta({ matches, location }: Route.MetaArgs) {
  return seoMeta({
    title: "Chunjia Fang",
    description:
      "Portfolio of Chunjia Fang — designer. Selected projects and work.",
    origin: rootOrigin(matches),
    path: location.pathname,
  });
}

export async function loader({}: Route.LoaderArgs) {
  const home = await client.fetch<Home>(homeQuery);

  return { home };
}

export default function Home() {
  const { home } = useLoaderData<typeof loader>();
  const coverAr = getMediaAspectRatio(home.cover.media);

  return (
    <div className="w-full">
      <h1 className="sr-only">Chunjia Fang</h1>
      <article className="">
        <section className="h-dvh pl-[20vw] pt-space-top flex items-end justify-end [container-type:size]">
          <h2 className="sr-only">Cover</h2>
          <div
            style={
              coverAr
                ? {
                    aspectRatio: coverAr,
                    // Largest box of the cover's ratio that fits the section's
                    // content area in BOTH axes (cq units are relative to the
                    // container's content box). `aspect-ratio` derives the
                    // height; flex pins the box to the bottom-right.
                    width: "min(100cqw, 100cqh * var(--cover-ar))",
                    ["--cover-ar" as string]: coverAr,
                  }
                : { width: "100%", height: "100%" }
            }
          >
            <MediaRenderer media={home.cover.media} fit="contain" />
          </div>
        </section>
        <section className="pl-space-left">
          <MediaGrid grid={home.grid} />
        </section>
      </article>
    </div>
  );
}
