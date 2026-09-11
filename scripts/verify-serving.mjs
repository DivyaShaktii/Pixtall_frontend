import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { createApp } from '../server.js';

const server = createApp().listen(0, '127.0.0.1');

try {
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const { port } = server.address();
  const fetchRoute = (pathname, options) => fetch(`http://127.0.0.1:${port}${pathname}`, options);

  const home = await fetchRoute('/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /<title>AI Product Image Generator for Ecommerce \| Pixtall AI<\/title>/);

  const terms = await fetchRoute('/terms');
  assert.equal(terms.status, 200);
  assert.match(await terms.text(), /<title>Terms of Service \| Pixtall AI<\/title>/);

  const legacyTerms = await fetchRoute('/legal/terms', { redirect: 'manual' });
  assert.equal(legacyTerms.status, 308);
  assert.equal(legacyTerms.headers.get('location'), '/terms');

  const termsFile = await fetchRoute('/terms.html', { redirect: 'manual' });
  assert.equal(termsFile.status, 308);
  assert.equal(termsFile.headers.get('location'), '/terms');

  const studio = await fetchRoute('/studio');
  assert.equal(studio.status, 200);
  assert.equal(studio.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.match(await studio.text(), /name="robots" content="noindex, nofollow, noarchive"/);

  const appShell = await fetchRoute('/app.html');
  assert.equal(appShell.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');

  const missing = await fetchRoute('/not-a-real-page');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('x-robots-tag'), 'noindex, follow');
  assert.match(await missing.text(), /name="robots" content="noindex, follow"/);

  const canonicalHost = await new Promise((resolve, reject) => {
    const request = httpRequest({
      hostname: '127.0.0.1',
      port,
      path: '/terms?source=audit',
      headers: { host: 'pixtall.com' },
    }, response => {
      response.resume();
      resolve(response);
    });
    request.once('error', reject);
    request.end();
  });
  assert.equal(canonicalHost.statusCode, 308);
  assert.equal(canonicalHost.headers.location, 'https://www.pixtall.com/terms?source=audit');

  console.log('Production serving verification passed.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
