import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '../config/site';

export { DEFAULT_SOCIAL_IMAGE, SITE_URL };

const HOME_SEO = {
  title: 'AI Product Image Generator for Ecommerce | Pixtall AI',
  description: 'Create marketplace-ready product photos with AI. Generate fashion, jewelry, beauty, footwear, and ecommerce images without a traditional studio shoot.',
  canonicalPath: '/',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  type: 'website',
};

const ROUTE_SEO = {
  '/terms': {
    title: 'Terms of Service | Pixtall AI',
    description: 'Read the terms that govern your use of the Pixtall AI product image generation platform and related services.',
    canonicalPath: '/terms',
    robots: 'index, follow',
    type: 'article',
  },
  '/404': {
    title: 'Page Not Found | Pixtall AI',
    description: 'The requested Pixtall AI page could not be found.',
    canonicalPath: '/404',
    robots: 'noindex, follow',
    type: 'website',
  },
};

const normalizePath = pathname => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

export const isPrivatePath = pathname => {
  const path = normalizePath(pathname);
  return path === '/studio' || path.startsWith('/studio/') || path === '/reset-password';
};

export const getSeoForPath = pathname => {
  const path = normalizePath(pathname);
  if (path === '/') return HOME_SEO;
  if (path === '/legal/terms') return ROUTE_SEO['/terms'];
  if (ROUTE_SEO[path]) return ROUTE_SEO[path];
  if (isPrivatePath(path)) {
    return {
      title: path === '/reset-password' ? 'Reset Password | Pixtall AI' : 'Pixtall AI Studio',
      description: 'Secure Pixtall AI account area.',
      canonicalPath: path,
      robots: 'noindex, nofollow, noarchive',
      type: 'website',
    };
  }
  return ROUTE_SEO['/404'];
};

export const structuredDataForPath = pathname => {
  const path = normalizePath(pathname);
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Pixtall AI',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
  };

  if (path !== '/') return [{ '@context': 'https://schema.org', ...organization }];

  return [
    { '@context': 'https://schema.org', ...organization },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Pixtall AI',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
    },
  ];
};

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

export const applySeoMetadata = pathname => {
  if (typeof document === 'undefined') return;
  const seo = getSeoForPath(pathname);
  const canonicalUrl = new URL(seo.canonicalPath, SITE_URL).href;

  document.title = seo.title;
  setMeta('meta[name="description"]', 'content', seo.description);
  setMeta('meta[name="robots"]', 'content', seo.robots);
  setMeta('meta[property="og:title"]', 'content', seo.title);
  setMeta('meta[property="og:description"]', 'content', seo.description);
  setMeta('meta[property="og:type"]', 'content', seo.type);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:image"]', 'content', DEFAULT_SOCIAL_IMAGE);
  setMeta('meta[name="twitter:title"]', 'content', seo.title);
  setMeta('meta[name="twitter:description"]', 'content', seo.description);
  setMeta('meta[name="twitter:image"]', 'content', DEFAULT_SOCIAL_IMAGE);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  document.head.querySelectorAll('script[data-pixtall-structured-data]').forEach(element => element.remove());
  structuredDataForPath(pathname).forEach(data => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.pixtallStructuredData = '';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  });
};
