import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '../src/config/site.js';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const serverBundle = path.join(projectRoot, '.prerender', 'entry-server.js');
const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
const { renderPage } = await import(pathToFileURL(serverBundle));

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const headMarkup = (seo, structuredData) => {
  const canonical = new URL(seo.canonicalPath, SITE_URL).href;
  const jsonLd = structuredData.map(data => (
    `<script type="application/ld+json" data-pixtall-structured-data>${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`
  )).join('\n    ');

  return `<!-- SEO_HEAD_START -->
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="robots" content="${escapeHtml(seo.robots)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="Pixtall AI" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="${seo.type}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${DEFAULT_SOCIAL_IMAGE}" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="558" />
    <meta property="og:image:alt" content="Examples of products transformed into AI-generated model photography" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${DEFAULT_SOCIAL_IMAGE}" />
    <meta name="twitter:image:alt" content="Examples of products transformed into AI-generated model photography" />
    ${jsonLd}
    <!-- SEO_HEAD_END -->`;
};

const createDocument = ({ pathname, includeMarkup = true }) => {
  const rendered = renderPage(pathname);
  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(rendered.seo.title)}</title>`)
    .replace(/<!-- SEO_HEAD_START -->.*?<!-- SEO_HEAD_END -->/s, headMarkup(rendered.seo, rendered.structuredData))
    .replace('<div id="root"></div>', `<div id="root">${includeMarkup ? rendered.html : ''}</div>`);
};

await writeFile(path.join(distDir, 'index.html'), createDocument({ pathname: '/' }));
await writeFile(path.join(distDir, 'terms.html'), createDocument({ pathname: '/terms' }));
await writeFile(path.join(distDir, '404.html'), createDocument({ pathname: '/404' }));
await writeFile(path.join(distDir, 'app.html'), createDocument({ pathname: '/studio', includeMarkup: false }));

await mkdir(path.join(distDir, '.well-known'), { recursive: true });
await writeFile(path.join(distDir, '.well-known', 'seo-build.json'), `${JSON.stringify({ prerendered: ['/', '/terms', '/404'], generatedAt: new Date().toISOString() }, null, 2)}\n`);
await rm(path.join(projectRoot, '.prerender'), { recursive: true, force: true });
