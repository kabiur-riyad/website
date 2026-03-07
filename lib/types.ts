export type Slug = {
  current: string;
};

export type ImageDimensions = {
  width: number;
  height: number;
};

export type SanityImage = {
  asset?: {
    _ref?: string;
  };
  assetMeta?: {
    dimensions?: ImageDimensions;
  };
};

export type Photo = {
  _id: string;
  title?: string;
  caption?: string;
  homeVisible?: boolean;
  image: SanityImage;
};

export type ProjectPhoto = {
  _key: string;
  image: SanityImage;
  caption?: string;
};

export type Project = {
  _id: string;
  title: string;
  slug: Slug;
  excerpt?: string;
  description?: any;
  coverImage?: SanityImage;
  photos?: ProjectPhoto[];
  relatedPhotos?: Photo[];
};

export type Person = {
  name?: string;
  alternateName?: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  image?: SanityImage;
  homeLocation?: {
    name?: string;
  };
  knowsAbout?: string[];
  sameAs?: string[];
};

export type SiteSettings = {
  _id: string;
  title?: string;
  bio?: any;
  portrait?: SanityImage;
  favicon?: SanityImage;
  email?: string;
  instagramUrl?: string;
  theme?: "default" | "white" | "dark";
  backgroundColor?: string;
  ogDescription?: string;
  contactBlurb?: any;
  contactFormEnabled?: boolean;
  defaultViewMode?: "grid" | "carousel";
  person?: Person;
};
