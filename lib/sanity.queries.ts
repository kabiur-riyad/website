export const photoGridQuery = `
  *[_type == "photo" && defined(image) && homeVisible != false] | order(orderRank asc) {
    _id,
    title,
    caption,
    image{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    }
  }
`;

export const latestPhotoQuery = `
  *[_type == "photo" && defined(image) && homeVisible != false] | order(orderRank asc)[0] {
    _id,
    title,
    image{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    }
  }
`;

export const projectsQuery = `
  *[_type == "project"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    }
  }
`;

export const projectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    coverImage{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    },
    photos[]{
      _key,
      image{
        ...,
        "assetMeta": asset->{
          metadata{dimensions}
        }
      },
      caption
    },
    "relatedPhotos": *[_type == "photo" && collection._ref == ^._id && defined(image)] | order(publishedAt desc) {
      _id,
      title,
      caption,
      image{
        ...,
        "assetMeta": asset->{
          metadata{dimensions}
        }
      }
    }
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    _id,
    title,
    bio,
    portrait{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    },
    favicon{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    },
    email,
    instagramUrl,
    theme,
    backgroundColor,
    ogDescription,
    contactBlurb,
    contactFormEnabled,
    defaultViewMode
  }
`;
export const sitemapDataQuery = `
  *[_type == "project"] {
    "slug": slug.current,
    "lastmod": _updatedAt
  }
`;
