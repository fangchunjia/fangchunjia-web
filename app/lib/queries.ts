import groq from "groq";

// Central home for GROQ queries and their shared projections. Fragments below are
// composed into the full queries so deref'd/computed fields stay defined once.

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

// Shared projection for a `media` object (image or Mux video). Keeps the
// deref'd/computed fields in one place so they can't drift:
// - video.asset is dereferenced for its Mux playbackId + `data.aspect_ratio`.
// - image gets its intrinsic `aspectRatio` from the asset dimensions metadata.
// The runtime shape is reflected by `EnrichedMedia` in _layout.projects._index.
export const mediaProjection = groq`
  media {
    mediaType,
    video {
      asset->{
        playbackId,
        assetId,
        status,
        "aspectRatio": data.aspect_ratio,
        "duration": data.duration
      }
    },
    image {
      ...,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    },
    alt
  }
`;

// Dereferenced category (typed as `CategoryDeref` in _layout.projects._index).
const categoryProjection = groq`
  category->{
    _id,
    title,
    slug
  }
`;

const labelsProjection = groq`
  labels[]-> { _id, title, slug }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

// Home page
export const homeQuery = groq`
  *[_type == "home"][0] {
    _id,
    cover {
      ${mediaProjection}
    },
    grid[_type == "mediaGridBlock"] {
      _type,
      _key,
      gridColumnStart,
      gridColumnSpan,
      gridRowStart,
      ${mediaProjection}
    }
  }
`;

// All projects for the index list, ordered by category then manual rank.
// Result shape: `ProjectInfo[]` (after `enrichCover`).
export const projectsQuery = groq`
  *[_type == "project"] | order(category->orderRank asc, orderRank asc) {
    _id,
    title,
    subtitle,
    year,
    slug,
    ${categoryProjection},
    cover {
      ${mediaProjection}
    },
    accentColor,
    ${labelsProjection}
  }
`;

// A single project by slug ($slug param), with the detail-only fields the project
// page needs. Only media grid blocks are fetched. Result shape: `ProjectDetail`.
export const projectDetailQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    subtitle,
    year,
    slug,
    externalLink,
    ${categoryProjection},
    cover {
      ${mediaProjection}
    },
    accentColor,
    description,
    ${labelsProjection},
    grid[_type == "mediaGridBlock"] {
      _type,
      _key,
      gridColumnStart,
      gridColumnSpan,
      gridRowStart,
      ${mediaProjection}
    }
  }
`;

// The singleton about document. Result shape: `About`.
export const aboutQuery = groq`
  *[_type == "about"][0] {
    _id,
    body,
  }
`;
