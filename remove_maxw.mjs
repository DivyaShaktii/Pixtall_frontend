import fs from 'fs';
import path from 'path';

const dir = 'src/components/marketing';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace max-w-[1200px] etc. with w-full
  const original = content;
  content = content.replace(/max-w-\[\d+px\]/g, 'w-full');
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
