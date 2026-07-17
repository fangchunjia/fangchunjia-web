import { useRef } from "react";
import type { MediaGridBlock } from "~/types/sanity.types";
import { getMediaAspectRatio } from "~/utils/getMediaAspectRatio";
import useInViewport from "~/hooks/useInViewport";
import MediaRenderer from "./MediaRenderer";

function MediaWrapper({ mediaGridBlock }: { mediaGridBlock: MediaGridBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  // Only play a cell's video while it's near/in the viewport; MediaRenderer runs
  // in controlled mode when `paused` is passed (no autoplay race).
  const inView = useInViewport(ref);

  return (
    <div
      ref={ref}
      style={{
        gridColumn:
          mediaGridBlock.gridColumnStart +
          " / span " +
          mediaGridBlock.gridColumnSpan,
        gridRow: mediaGridBlock.gridRowStart,
        // Cell width comes from the column span; height follows from the media's
        // intrinsic ratio.
        aspectRatio: getMediaAspectRatio(mediaGridBlock.media),
      }}
    >
      <MediaRenderer
        media={mediaGridBlock.media}
        fit="contain"
        paused={!inView}
      />
    </div>
  );
}

export default function MediaGrid({
  grid,
}: {
  grid: (MediaGridBlock & { _key: string })[];
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {grid &&
        grid.map((m) => <MediaWrapper mediaGridBlock={m} key={m._key} />)}
    </div>
  );
}
