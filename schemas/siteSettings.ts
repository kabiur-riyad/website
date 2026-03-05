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
      name: "backgroundColor",
      title: "Background Color (Hex)",
      type: "string",
      initialValue: "#f6f4f1",
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{6})$/, {
          name: "hex color",
          invert: false,
        }),
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "White", value: "white" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
      },
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
    defineField({
      name: "collectionDefaultViewMode",
      title: "Collection View Mode",
      type: "string",
      initialValue: "grid",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Carousel", value: "carousel" },
        ],
        layout: "radio",
      },
      description:
        "Default view mode for photos inside each collection page.",
    }),
  ],
});
