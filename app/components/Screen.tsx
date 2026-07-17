import type { ProjectInfo } from "~/routes/_layout.projects._index";
import MediaRenderer from "./MediaRenderer";

export default function Screen({
  item,
}: {
  item: Pick<ProjectInfo, "slug" | "cover"> | null;
}) {
  return (
    <div className="w-full h-full pointer-events-none relative">
      {item && <MediaRenderer media={item.cover.media} fit="cover" />}
    </div>
  );
}
