import { defineType, defineField } from "sanity";

export default defineType({
    name: "person",
    title: "Person",
    type: "object",
    fields: [
        defineField({
            name: "name",
            title: "Name",
            type: "string",
            initialValue: "Kabiur Rahman Riyad",
        }),
        defineField({
            name: "alternateName",
            title: "Alternate Name",
            type: "string",
            initialValue: "কাবিউর রহমান রিয়াদ",
        }),
        defineField({
            name: "jobTitle",
            title: "Job Title",
            type: "string",
            initialValue: "Street and Documentary Photographer",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
            initialValue: "Street, travel, and documentary photographer exploring everyday life and human stories.",
        }),
        defineField({
            name: "url",
            title: "URL",
            type: "url",
            initialValue: "https://riyad.pro.bd",
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "homeLocation",
            title: "Home Location",
            type: "object",
            fields: [
                defineField({
                    name: "name",
                    title: "Location Name",
                    type: "string",
                    initialValue: "Bangladesh",
                }),
            ],
        }),
        defineField({
            name: "knowsAbout",
            title: "Knows About",
            type: "array",
            of: [{ type: "string" }],
            initialValue: [
                "Street photography",
                "Documentary photography",
                "Travel photography",
            ],
        }),
        defineField({
            name: "sameAs",
            title: "Same As (Social Links)",
            type: "array",
            of: [{ type: "url" }],
        }),
    ],
});
