const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\AhmedMahdy\\.gemini\\antigravity\\brain\\8a4067b9-2d8f-4db3-8f81-4e215cc20e00';
const destDir = 'public\\manager-assets';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  { name: 'media__1779110447786.jpg', out: 'scene-t1.webp' },
  { name: 'media__1779110447823.jpg', out: 'scene-t2.webp' },
  { name: 'media__1779110447877.jpg', out: 'scene-t3.webp' },
  { name: 'media__1779110447948.jpg', out: 'scene-landside.webp' },
  { name: 'media__1779110447965.jpg', out: 'scene-support.webp' }
];

async function convert() {
  for (const f of files) {
    const p = path.join(srcDir, f.name);
    const dest = path.join(destDir, f.out);
    await sharp(p)
      .webp({ quality: 80 })
      .toFile(dest);
    console.log('Converted', f.name, 'to', f.out);
  }
}

convert().catch(console.error);
