const fs = require('fs');
const path = require('path');

function updateManifest() {
  const seriesDir = path.join(__dirname, 'images', 'series-1');
  
  if (!fs.existsSync(seriesDir)) {
    console.log('Cartella images/series-1/ non trovata.');
    return;
  }

  const files = fs.readdirSync(seriesDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log('Nessuna immagine trovata.');
    return;
  }

  const images = files.map((file, index) => ({
    filename: `images/series-1/${file}`,
    title: `Opera ${String(index + 1).padStart(2, '0')}`,
    description: `Opera ${String(index + 1).padStart(2, '0')} della serie Human Frequency`,
    meta: '2024 · AI Generative'
  }));

  const manifest = {
    site: {
      name: 'Andrea Spinazzola',
      hero: {
        seriesId: 'series-1',
        interval: 5000
      }
    },
    series: [
      {
        id: 'series-1',
        title: 'Human Frequency',
        subtitle: 'Series I — Faces · AI Generative · 2024',
        images: images
      }
    ]
  };

  fs.writeFileSync(
    path.join(__dirname, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );

  console.log(`✅ manifest.json aggiornato con ${files.length} immagine(i):`);
  files.forEach(f => console.log(`   - ${f}`));
}

updateManifest();
