# Hosting and SEO

## GitHub Pages

The `build:pages` script runs the normal type-check and production build with `/intellegent_fleet_tracking_system/` as Vite's base path. The Pages workflow uses this script so JavaScript, stylesheets, manifests, and client-side routes resolve under the repository subpath. `public/404.html` sends direct route visits to the generated `app.html` shell and restores the requested path before the React router starts.

## Vercel

`vercel.json` rewrites `/demo` and the student, parent, driver, and admin workspace paths to `app.html`. This preserves client-side navigation on direct visits while leaving static files such as `robots.txt`, `sitemap.xml`, and social preview assets to be served directly.

## Search metadata

The public overview is prerendered into `dist/index.html` for crawlers and link previews. The generated `dist/app.html` shell uses `noindex, nofollow, noarchive`; route metadata sets route-specific titles and descriptions and keeps demo workspaces non-indexable after the app loads. The sitemap lists only the public overview, and the configured canonical origin is the Vercel production domain.

Verify the output with `npm run build:pages` and `npm test`. The production build reports the existing large MapLibre chunk warning; the output is still generated successfully.
