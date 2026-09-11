import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE_URL } from '../src/config/site.js';

const distDir = path.join(process.cwd(), 'dist');

const read = filename => readFile(path.join(distDir, filename), 'utf8');
const requireMatch = (content, pattern, message) => {
  if (!pattern.test(content)) throw new Error(`SEO build verification failed: ${message}`);
};
const renderedText = content => content
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/<!--.*?-->/gs, ' ')
  .replace(/\s+/g, ' ');
const matches = (content, pattern) => [...content.matchAll(pattern)];
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

await Promise.all([
  access(path.join(distDir, 'robots.txt')),
  access(path.join(distDir, 'sitemap.xml')),
  access(path.join(distDir, 'favicon.svg')),
  access(path.join(distDir, 'site.webmanifest')),
]);

const [home, terms, notFound, appShell, robots, sitemap] = await Promise.all([
  read('index.html'),
  read('terms.html'),
  read('404.html'),
  read('app.html'),
  read('robots.txt'),
  read('sitemap.xml'),
]);
const homeText = renderedText(home);
const termsText = renderedText(terms);
const notFoundText = renderedText(notFound);
const titleOf = content => content.match(/<title>(.*?)<\/title>/s)?.[1];
const descriptionOf = content => content.match(/<meta name="description" content="([^"]+)"/i)?.[1];

if (!home.includes(`<link rel="canonical" href="${SITE_URL}/"`)) {
  throw new Error('SEO build verification failed: homepage canonical is missing');
}
requireMatch(home, /<h1[\s>]/i, 'homepage was not pre-rendered');
if (matches(home, /<h1[\s>]/gi).length !== 1) {
  throw new Error('SEO build verification failed: homepage must contain exactly one H1');
}
requireMatch(homeText, /AI product image generator for Amazon/i, 'homepage search copy is missing from initial HTML');
requireMatch(homeText, /Pay as You Go/i, 'pricing is missing from initial HTML');
requireMatch(home, /"@type":"Organization"/i, 'Organization structured data is missing');
requireMatch(home, /"@type":"WebSite"/i, 'WebSite structured data is missing');
requireMatch(home, /"@type":"WebPage"/i, 'WebPage structured data is missing');
requireMatch(home, /contact@aivatika\.com/i, 'Organization contact data is missing');
requireMatch(home, /name="twitter:image:alt"/i, 'social image alternative text is missing');

if (!terms.includes(`<link rel="canonical" href="${SITE_URL}/terms"`)) {
  throw new Error('SEO build verification failed: Terms canonical is missing');
}
requireMatch(terms, /<h1[\s>]/i, 'Terms page heading is missing');
if (matches(terms, /<h1[\s>]/gi).length !== 1) {
  throw new Error('SEO build verification failed: Terms must contain exactly one H1');
}
requireMatch(termsText, /Terms of Service/i, 'Terms page was not pre-rendered');
requireMatch(terms, /"@type":"BreadcrumbList"/i, 'Terms breadcrumb data is missing');
if (titleOf(home) === titleOf(terms) || descriptionOf(home) === descriptionOf(terms)) {
  throw new Error('SEO build verification failed: indexable pages need unique titles and descriptions');
}

requireMatch(notFound, /name="robots" content="noindex, follow"/i, '404 page must be noindex');
requireMatch(notFoundText, /This page didn’t make the final cut/i, '404 page was not pre-rendered');
if (notFound.includes('application/ld+json')) {
  throw new Error('SEO build verification failed: 404 page must not contain structured data');
}

requireMatch(appShell, /name="robots" content="noindex, nofollow, noarchive"/i, 'private app shell must be noindex');
requireMatch(appShell, /<div id="root"><\/div>/i, 'private app shell must not contain public pre-rendered content');

if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
  throw new Error('SEO build verification failed: robots.txt does not advertise the sitemap');
}
if (!sitemap.includes(`<loc>${SITE_URL}/</loc>`)) {
  throw new Error('SEO build verification failed: sitemap is missing the homepage');
}
if (!sitemap.includes(`<loc>${SITE_URL}/terms</loc>`)) {
  throw new Error('SEO build verification failed: sitemap is missing Terms');
}

for (const [name, content] of [['homepage', home], ['Terms', terms]]) {
  if (/href="#"/i.test(content)) {
    throw new Error(`SEO build verification failed: ${name} contains a placeholder link`);
  }
  if (/pixtall\.ai/i.test(content)) {
    throw new Error(`SEO build verification failed: ${name} contains the retired .ai domain`);
  }
}

for (const tag of matches(home, /<img\b[^>]*>/gi).map(match => match[0])) {
  if (!attribute(tag, 'alt')) {
    throw new Error('SEO build verification failed: homepage image is missing descriptive alt text');
  }
  if (!attribute(tag, 'width') || !attribute(tag, 'height')) {
    throw new Error('SEO build verification failed: homepage image is missing intrinsic dimensions');
  }
}

const publicDocuments = [home, terms];
const localReferences = new Set(publicDocuments.flatMap(content => (
  matches(content, /\b(?:href|src)="(\/[^"#?]*)/gi).map(match => match[1])
)));
for (const reference of localReferences) {
  if (reference === '/' || reference === '/terms') continue;
  const localPath = decodeURIComponent(reference).replace(/^\/+/, '');
  await access(path.join(distDir, localPath)).catch(() => {
    throw new Error(`SEO build verification failed: broken local reference ${reference}`);
  });
}

console.log('SEO build verification passed.');
