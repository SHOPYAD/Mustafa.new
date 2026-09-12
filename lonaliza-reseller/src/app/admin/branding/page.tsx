import { redirect } from "next/navigation";

/** Branding lives only in the visual editor. Old control-panel URL is gone. */
export default function AdminBrandingRedirect() {
  redirect("/admin/homepage-editor?panel=design");
}
