import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "photography-portfolio",
  title: "Photography Portfolio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1descy2t",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [
    deskTool({
      structure: (S, context) => {
        return S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({
              type: "photo",
              title: "Photos",
              S: S as any,
              context,
            }) as any,
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item: any) => item.getId() !== "photo"
            ),
          ]);
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
