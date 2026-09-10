import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE_URL } from '../src/config/site.js';

const publicDir = path.join(process.cwd(), 'public');
const today = new Date().toISOString().slice(0, 10);

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/terms</loc>
    <lastmod>2026-09-03</lastmod>
  </url>
</urlset>
`;

await Promise.all([
  writeFile(path.join(publicDir, 'robots.txt'), robots),
  writeFile(path.join(publicDir, 'sitemap.xml'), sitemap),
]);

console.log(`Generated robots.txt and sitemap.xml for ${SITE_URL}.`);
