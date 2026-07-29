import fs from 'fs';

const original = fs.readFileSync('src/components/marketing/Hero.jsx', 'utf8');

const base = original.replace(
  /variants=\{\{\n\s*hidden: \{ opacity: 0 \},\n\s*visible: \{\n\s*opacity: 1,\n\s*transition: \{ staggerChildren: 0.15, delayChildren: 0.1 \}\n\s*\}\n\s*\}\}/g,
  'VARIANTS_PLACEHOLDER'
).replace(
  /variants=\{\{ hidden: \{ opacity: 0, y: 40 \}, visible: \{ opacity: 1, y: 0, transition: \{ duration: 1, ease: \[0.16, 1, 0.3, 1\] \} \} \}\}/g,
  'CHILD_VARIANTS_PLACEHOLDER'
);

const v1 = base
  .replace('VARIANTS_PLACEHOLDER', 'variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.5, delayChildren: 0.2 } } }}')
  .replace(/CHILD_VARIANTS_PLACEHOLDER/g, 'variants={{ hidden: { opacity: 0, filter: "blur(10px)", scale: 0.9 }, visible: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } } }}');

const v2 = base
  .replace('VARIANTS_PLACEHOLDER', 'variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.8, delayChildren: 0.3 } } }}')
  .replace(/CHILD_VARIANTS_PLACEHOLDER/g, 'variants={{ hidden: { opacity: 0, y: 80, rotateX: 90 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1.5, type: "spring", bounce: 0.4 } } }}');

const v3 = base
  .replace('VARIANTS_PLACEHOLDER', 'variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.6, delayChildren: 0.1 } } }}')
  .replace(/CHILD_VARIANTS_PLACEHOLDER/g, 'variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: "easeOut" } } }}');

fs.mkdirSync('/Users/rajashekarhs/.gemini/antigravity-ide/brain/877e07e1-b71f-48f9-aed2-d7c9c44c951e/scratch', { recursive: true });

fs.writeFileSync('/Users/rajashekarhs/.gemini/antigravity-ide/brain/877e07e1-b71f-48f9-aed2-d7c9c44c951e/scratch/Hero-1.jsx', v1);
fs.writeFileSync('/Users/rajashekarhs/.gemini/antigravity-ide/brain/877e07e1-b71f-48f9-aed2-d7c9c44c951e/scratch/Hero-2.jsx', v2);
fs.writeFileSync('/Users/rajashekarhs/.gemini/antigravity-ide/brain/877e07e1-b71f-48f9-aed2-d7c9c44c951e/scratch/Hero-3.jsx', v3);
