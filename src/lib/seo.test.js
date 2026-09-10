import { beforeEach, describe, expect, it } from 'vitest';
import { applySeoMetadata, getSeoForPath, isPrivatePath, structuredDataForPath } from './seo';

describe('SEO metadata', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Old title</title>';
  });

  it('uses indexable canonical metadata for public routes', () => {
    expect(getSeoForPath('/').robots).toContain('index, follow');
    expect(getSeoForPath('/terms/').canonicalPath).toBe('/terms');
    expect(structuredDataForPath('/').map(item => item['@type'])).toEqual(['Organization', 'WebSite']);
  });

  it('prevents indexing of private and unknown routes', () => {
    expect(isPrivatePath('/studio')).toBe(true);
    expect(isPrivatePath('/studio/jobs/123')).toBe(true);
    expect(getSeoForPath('/reset-password').robots).toContain('noindex');
    expect(getSeoForPath('/missing-page').robots).toContain('noindex');
  });

  it('updates the live document head when the route changes', () => {
    applySeoMetadata('/terms');

    expect(document.title).toBe('Terms of Service | Pixtall AI');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://pixtall.ai/terms');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('terms'));
    expect(document.querySelectorAll('script[data-pixtall-structured-data]')).toHaveLength(1);
  });
});
