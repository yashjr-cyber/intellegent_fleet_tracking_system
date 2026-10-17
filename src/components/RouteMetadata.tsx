import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { canonicalOrigin, getPageMetadata } from "../seo/metadata";

function setMeta(attribute: "name" | "property", key: string, content: string | null) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (content === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    const robots = metadata.indexable ? "index, follow" : "noindex, nofollow, noarchive";
    const canonicalUrl = metadata.canonicalUrl ?? null;

    document.title = metadata.title;
    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Wayfinder Mobility");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", `${canonicalOrigin}/social-preview.png`);
    setMeta("property", "og:image:alt", "Wayfinder Mobility campus transportation prototype");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);
    setMeta("name", "twitter:image", `${canonicalOrigin}/social-preview.png`);
    setMeta("name", "twitter:image:alt", "Wayfinder Mobility campus transportation prototype");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
}
