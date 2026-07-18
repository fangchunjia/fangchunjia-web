import type { Route } from "./+types/_layout._index";
import { rootOrigin, seoMeta } from "~/lib/seo";

export function meta({ matches, location }: Route.MetaArgs) {
  return seoMeta({
    title: "Chunjia Fang",
    description: "Portfolio of Chunjia Fang — designer. Selected projects and work.",
    origin: rootOrigin(matches),
    path: location.pathname,
  });
}

export default function Home() {
  return (
    <div className="w-full flex flex-1">
      <h1 className="sr-only">Chunjia Fang</h1>
      <article className="m-auto">Waiting for Jiajia's design ^_^</article>
    </div>
  );
}
