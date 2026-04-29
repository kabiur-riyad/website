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

export type PhotoLicense = "all-rights-reserved" | "unsplash" | "cc-by-nc";

export type Photo = {
  _id: string;
  title?: string;
  year?: number;
  location?: string;
  caption?: string;
  homeVisible?: boolean;
  license?: PhotoLicense;
  image: SanityImage;
};

export type ProjectPhoto = {
  _key: string;
  image: SanityImage;
  caption?: string;
  license?: PhotoLicense;
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
  aboutIntro?: string;
  aboutLinks?: {
    _key?: string;
    label?: string;
    url?: string;
  }[];
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
