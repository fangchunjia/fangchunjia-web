// import { combineMedia } from "../utils/combineMedia";
import MediaRenderer from "./MediaRenderer";
import { useEffect } from "react";
import { urlFor } from "~/lib/sanity";

function MediaWrapper({ media }: { media: any }) {
  // console.log(media);
  console.log(media);
  return (
    <div
      style={{
        gridColumn: media.gridColumnStart + " / span " + media.gridColumnSpan,
      }}
    >
      {/* <MediaRenderer media={media} /> */}
      <img src={urlFor(media.image.asset._ref).url()} />
    </div>
  );
}

export default function MediaGrid({ grid }: { grid: any[] }) {
  return (
    <div className="grid grid-cols-12 gap-8">
      {grid &&
        grid.map((m) => <MediaWrapper media={m} key={m.image.asset._ref} />)}
      {/* {combineMedia(media, mediaLayout).map((m) => (
        <MediaWrapper media={m} key={m.key} />
      ))} */}
    </div>
  );
}
