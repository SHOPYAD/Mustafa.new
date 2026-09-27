import { redirect } from "next/navigation";

export default function AdminHomepageRedirectPage() {
  redirect("/admin/homepage-editor");
}
