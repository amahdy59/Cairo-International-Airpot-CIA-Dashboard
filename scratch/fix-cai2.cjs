const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// String replacement CAI -> CIA
code = code.replaceAll('CAI Command Hub', 'CIA Command Hub');
code = code.replaceAll('IATA: CAI', 'IATA: CIA');
code = code.replaceAll('CAI operations sample', 'CIA operations sample');
code = code.replaceAll('CAI status: NORMAL', 'CIA status: NORMAL');
code = code.replaceAll('Incoming CAI Flights', 'Incoming CIA Flights');

// Update images in scenes array
const imgMap = [
  { id: 'terminal-3', file: 'scene-t3.webp' },
  { id: 'terminal-2', file: 'scene-t2.webp' },
  { id: 'terminal-1', file: 'scene-t1.webp' },
  { id: 'landside', file: 'scene-landside.webp' },
  { id: 'support', file: 'scene-support.webp' }
];

for (const m of imgMap) {
  const marker = 'id: "' + m.id + '",';
  const parts = code.split(marker);
  if (parts.length > 1) {
    const afterMarker = parts[1];
    const urlMarker = 'url: "';
    const urlStart = afterMarker.indexOf(urlMarker);
    if (urlStart !== -1) {
      const urlEnd = afterMarker.indexOf('"', urlStart + urlMarker.length);
      if (urlEnd !== -1) {
        const urlToReplace = afterMarker.substring(urlStart, urlEnd + 1);
        const newUrl = 'url: "/manager-assets/' + m.file + '"';
        parts[1] = afterMarker.replace(urlToReplace, newUrl);
        code = parts.join(marker);
      }
    }
  }
}

fs.writeFileSync('src/App.tsx', code);
