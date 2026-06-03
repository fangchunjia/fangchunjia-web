import { urlFor } from "~/lib/sanity";

export default function MediaRenderer({ media }: { media: Media }) {
  return (
    <>
      {media.contentType?.startsWith("image") ? (
        <img
          className="w-full h-full object-cover"
          title={media.key}
          src={urlFor(
            "image-71c7dc1e6f0ceadd5d2dd9fb1e641a894566f026-1654x2339-jpg",
          )
            .width(800)
            .height(600)
            .url()}
          // src={`https://files.fangchunjia.com/${media.key}`}
        />
      ) : media.contentType?.startsWith("video") ? (
        <video
          muted
          autoPlay
          playsInline
          controls
          loop
          title={media.key}
          className="w-full h-full object-cover"
        >
          <source
            src={`https://files.fangchunjia.com/${media.key}`}
            type={media.contentType}
          />
        </video>
      ) : media.contentType?.startsWith("audio") ? (
        <>
          <audio controls className="w-full">
            <source
              src={`https://files.fangchunjia.com/${media.key}`}
              type={media.contentType}
            />
          </audio>
        </>
      ) : (
        <div
          className="p-4 bg-fangchunjia-lightgray cursor-default text-sm"
          title={media.key}
        >
          Missing or unsupported media type
        </div>
      )}
    </>
  );
}
