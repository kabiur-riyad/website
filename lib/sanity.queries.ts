export const photoGridQuery = `
  *[_type == "photo" && defined(image) && homeVisible != false] | order(orderRank asc) {
    _id,
    title,
    year,
    location,
    caption,
    license,
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
    location,
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
      caption,
      license
    },
    "relatedPhotos": *[_type == "photo" && collection._ref == ^._id && defined(image)] | order(publishedAt desc) {
      _id,
      title,
      location,
      caption,
      license,
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
    aboutIntro,
    aboutLinks[]{
      _key,
      label,
      url
    },
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
    defaultViewMode,
    person {
      ...,
      image {
        ...,
        "assetMeta": asset->{
          metadata{dimensions}
        }
      }
    }
  }
`;
export const sitemapDataQuery = `
  *[_type == "project"] {
    "slug": slug.current,
    "lastmod": _updatedAt
  }
`;

export const photoByIdQuery = `
  *[_type == "photo" && _id == $id][0] {
    _id,
    title,
    year,
    location,
    caption,
    image{
      ...,
      "assetMeta": asset->{
        metadata{dimensions}
      }
    }
  }
`;
