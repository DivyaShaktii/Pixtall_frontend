import React from 'react';
import { renderToString } from 'react-dom/server';
import MarketingPage from './components/MarketingPage';
import NotFoundPage from './components/NotFoundPage';
import TermsPage from './views/legal/TermsPage';
import { getSeoForPath, structuredDataForPath } from './lib/seo';

export const renderPage = pathname => {
  let element;
  if (pathname === '/') {
    element = <MarketingPage />;
  } else if (pathname === '/terms') {
    element = <TermsPage />;
  } else {
    element = <NotFoundPage />;
  }

  return {
    html: renderToString(element),
    seo: getSeoForPath(pathname),
    structuredData: structuredDataForPath(pathname),
  };
};
