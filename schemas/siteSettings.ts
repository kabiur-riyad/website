import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "About Bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      options: { hotspot: false },
      description: "Square image recommended (e.g. 512x512).",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    }),
    defineField({
      name: "contactBlurb",
      title: "Contact Blurb",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "contactFormEnabled",
      title: "Enable Contact Form",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
