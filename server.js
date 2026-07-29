// server.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(dirname(__dirname) + '/dist/index.html');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});