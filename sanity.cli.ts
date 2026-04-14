import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1descy2t";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    appId: "kvge9m9spvntzuumxkwjznr2",
    autoUpdates: true,
  },
});
