import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "photography-portfolio",
  title: "Photography Portfolio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1descy2t",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [deskTool()],

  schema: {
    types: schemaTypes,
  },
});
