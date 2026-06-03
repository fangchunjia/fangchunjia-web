import Breeze from "~/components/Breeze";
import type { Route } from "./+types/_layout.home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <div className="w-full h-full overflow-clip flex justify-center">
        <div className="fixed top-0 right-0 px-2 py-1 text-white mix-blend-difference">
          {/* {hoveredHighlight?.name} */}
        </div>
        <Breeze setHoveredIndex={() => {}} />
      </div>
    </>
  );
}
