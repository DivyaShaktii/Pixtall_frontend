import express from 'express';
import cors from 'cors';
import sharp from 'sharp';

const app = express();
const port = 3001;

app.use(cors());
// Increase payload limit for large base64 image strings
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate_image', async (req, res) => {
  try {
    const { productImage, size, numImages = 1 } = req.body;

    if (!productImage) {
      return res.status(400).json({ error: 'productImage is required' });
    }

    // Determine target dimensions based on requested size. Base scale: 800px
    let targetWidth = 800;
    let targetHeight = 800;
    
    if (size) {
      const [wStr, hStr] = size.split(':');
      const wRatio = parseInt(wStr, 10);
      const hRatio = parseInt(hStr, 10);
      
      if (wRatio > hRatio) {
        // Wide image
        targetWidth = 800;
        targetHeight = Math.round(800 * (hRatio / wRatio));
      } else {
        // Tall or square image
        targetHeight = 800;
        targetWidth = Math.round(800 * (wRatio / hRatio));
      }
    }

    // Extract the base64 data
    const base64Data = productImage.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use Sharp to resize and crop to the exact aspect ratio
    const processedBuffer = await sharp(imageBuffer)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    const resultBase64 = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain'); // using text for streaming NDJSON
    res.setHeader('Transfer-Encoding', 'chunked');

    // Simulate streaming process
    for (let i = 0; i < numImages; i++) {
      // Small artificial delay to mimic generation time (e.g., 800ms per image)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const payload = {
        image: resultBase64,
        index: i
      };
      
      res.write(JSON.stringify(payload) + '\n');
    }
    
    res.end();
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

app.listen(port, () => {
  console.log(`Mock API Server running at http://localhost:${port}`);
});
