// import { combineMedia } from "../utils/combineMedia";
import type { MediaGridBlock } from "~/types/sanity.types";
import MediaRenderer from "./MediaRenderer";

function MediaWrapper({ mediaGridBlock }: { mediaGridBlock: MediaGridBlock }) {
  return (
    <div
      style={{
        gridColumn:
          mediaGridBlock.gridColumnStart +
          " / span " +
          mediaGridBlock.gridColumnSpan,
        gridRow: mediaGridBlock.gridRowStart,
      }}
    >
      <MediaRenderer media={mediaGridBlock.media} objectFit="cover" />
    </div>
  );
}

export default function MediaGrid({ grid }: { grid: MediaGridBlock[] }) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {grid &&
        grid.map((m) => (
          <MediaWrapper mediaGridBlock={m} key={m.media?._type} />
        ))}
    </div>
  );
}
