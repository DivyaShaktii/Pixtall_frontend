import { beforeEach, describe, expect, it } from 'vitest';
import { applySeoMetadata, getSeoForPath, isPrivatePath, structuredDataForPath } from './seo';

describe('SEO metadata', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Old title</title>';
  });

  it('uses indexable canonical metadata for public routes', () => {
    expect(getSeoForPath('/').robots).toContain('index, follow');
    expect(getSeoForPath('/terms/').canonicalPath).toBe('/terms');
    expect(structuredDataForPath('/').map(item => item['@type'])).toEqual([
      'Organization',
      'WebSite',
      'WebPage',
    ]);
    expect(structuredDataForPath('/terms').map(item => item['@type'])).toContain('BreadcrumbList');
    const organization = structuredDataForPath('/')[0];
    expect(organization.email).toBe('contact@aivatika.com');
    expect(organization.contactPoint.email).toBe('support@aivatika.com');
  });

  it('prevents indexing of private and unknown routes', () => {
    expect(isPrivatePath('/studio')).toBe(true);
    expect(isPrivatePath('/studio/jobs/123')).toBe(true);
    expect(getSeoForPath('/reset-password').robots).toContain('noindex');
    expect(getSeoForPath('/missing-page').robots).toContain('noindex');
    expect(structuredDataForPath('/missing-page')).toEqual([]);
  });

  it('updates the live document head when the route changes', () => {
    applySeoMetadata('/terms');

    expect(document.title).toBe('Terms of Service | Pixtall AI');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.pixtall.com/terms');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('terms'));
    expect(document.querySelectorAll('script[data-pixtall-structured-data]')).toHaveLength(4);
  });
});
