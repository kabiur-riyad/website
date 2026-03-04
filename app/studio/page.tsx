import { redirect } from "next/navigation";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1descy2t";
const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  `https://${projectId}.sanity.studio`;

export default function StudioRedirect() {
  redirect(studioUrl);
}
