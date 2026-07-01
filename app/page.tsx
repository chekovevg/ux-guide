import { redirect } from "next/navigation";
import { firstGuideSlug } from "@/content/guide";

export default function Home() {
  redirect(`/guide/${firstGuideSlug}`);
}
