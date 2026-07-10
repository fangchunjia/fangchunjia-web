import type { Route } from "./+types/_layout._index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chunjia Fang" },
    { name: "description", content: "Chunjia Fang's Site" },
  ];
}

export default function Home() {
  return (
    <div className="w-full flex flex-1">
      <article className="m-auto">Waiting for Jiajia's design ^_^</article>
    </div>
  );
}
