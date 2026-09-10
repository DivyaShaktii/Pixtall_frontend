const environmentSiteUrl = typeof process !== 'undefined'
  ? process.env?.VITE_SITE_URL
  : import.meta.env?.VITE_SITE_URL;

export const SITE_URL = (environmentSiteUrl || 'https://www.pixtall.com').replace(/\/+$/, '');
export const SOCIAL_IMAGE_PATH = '/assets/marketing/media__1784835515164.jpg';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}${SOCIAL_IMAGE_PATH}`;
