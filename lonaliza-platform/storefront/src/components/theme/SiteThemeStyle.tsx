import { getBrandTheme } from "@/lib/server/brand-theme-store";
import { themeToCssText } from "@/lib/theme/tokens";

/** Server-injected CSS so the first paint already has the saved theme. */
export default async function SiteThemeStyle() {
  const theme = await getBrandTheme();
  return (
    <style
      id="brand-theme-vars"
      dangerouslySetInnerHTML={{ __html: themeToCssText(theme) }}
    />
  );
}
