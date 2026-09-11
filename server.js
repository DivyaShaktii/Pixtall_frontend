import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

const sendDocument = filename => (_request, response) => {
  response.sendFile(path.join(distPath, filename));
};

const privateRoute = filename => (_request, response) => {
  response.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.sendFile(path.join(distPath, filename));
};

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.enable('strict routing');

  app.use((request, response, next) => {
    const forwardedHost = request.get('x-forwarded-host');
    const hostname = (forwardedHost || request.get('host') || '')
      .split(',')[0]
      .trim()
      .split(':')[0]
      .toLowerCase();
    if (hostname === 'pixtall.com') {
      response.redirect(308, `https://www.pixtall.com${request.originalUrl}`);
      return;
    }
    next();
  });

  app.get('/legal/terms', (_request, response) => response.redirect(308, '/terms'));
  app.get('/index.html', (_request, response) => response.redirect(308, '/'));
  app.get('/terms.html', (_request, response) => response.redirect(308, '/terms'));
  app.get('/terms/', (_request, response) => response.redirect(308, '/terms'));
  app.get('/terms', sendDocument('terms.html'));

  app.get('/app.html', privateRoute('app.html'));
  app.get('/404.html', (_request, response) => {
    response.set('X-Robots-Tag', 'noindex, follow');
    response.status(404).sendFile(path.join(distPath, '404.html'));
  });
  app.get('/studio/', (_request, response) => response.redirect(308, '/studio'));
  app.get(/^\/studio(?:\/.*)?$/, privateRoute('app.html'));
  app.get('/reset-password/', (_request, response) => response.redirect(308, '/reset-password'));
  app.get(/^\/reset-password(?:\/.*)?$/, privateRoute('app.html'));

  app.use(express.static(distPath, {
    setHeaders(response, filePath) {
      const filename = path.basename(filePath);
      const isFingerprintedAsset = /-[A-Za-z0-9_-]{8,}\.(?:css|js)$/i.test(filename);
      if (isFingerprintedAsset) {
        response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.(?:avif|gif|jpe?g|png|svg|webp|mp4)$/i.test(filename)) {
        response.setHeader('Cache-Control', 'public, max-age=604800');
      }
    },
  }));

  app.get('/', sendDocument('index.html'));
  app.get(/.*/, (_request, response) => {
    response.set('X-Robots-Tag', 'noindex, follow');
    response.status(404).sendFile(path.join(distPath, '404.html'));
  });

  return app;
};

export const startServer = (port = PORT) => createApp().listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

if (path.resolve(process.argv[1] || '') === __filename) startServer();
