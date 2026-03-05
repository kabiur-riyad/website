import { redirect } from "next/navigation";

const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  "https://riyad-site.sanity.studio";

export default function StudioRedirect() {
  redirect(studioUrl);
}
