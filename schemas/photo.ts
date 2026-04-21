import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export default defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "photo" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Untitled",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.integer().min(1800).max(2100),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "homeVisible",
      title: "Show On Home Grid",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "collection",
      title: "Collection",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "license",
      title: "License",
      description: "Choose the license for this photo",
      type: "string",
      options: {
        list: [
          { title: "All Rights Reserved", value: "all-rights-reserved" },
          { title: "Unsplash License", value: "unsplash" },
          { title: "CC BY-NC 4.0 (Attribution-NonCommercial)", value: "cc-by-nc" },
        ],
        layout: "dropdown",
      },
      initialValue: "all-rights-reserved",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      media: "image",
    },
    prepare(selection) {
      return {
        title: selection.title || "Photo",
        subtitle: selection.subtitle,
        media: selection.media,
      };
    },
  },
});
