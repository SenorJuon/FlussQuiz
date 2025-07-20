const fs = require('fs');
const path = require('path');

const ordner = './geojson'; // dein Ordner mit Einzeldateien
const zieldatei = 'alle_fluesse.geojson';

let alleFeatures = [];

fs.readdirSync(ordner).forEach((datei) => {
  if (datei.endsWith('.geojson')) {
    const inhalt = fs.readFileSync(path.join(ordner, datei), 'utf8');
    const geojson = JSON.parse(inhalt);

    if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
      alleFeatures.push(...geojson.features);
    } else {
      console.warn(`⚠️ Datei ${datei} ist keine gültige FeatureCollection.`);
    }
  }
});

const zusammengefuegt = {
  type: 'FeatureCollection',
  features: alleFeatures,
};

fs.writeFileSync(zieldatei, JSON.stringify(zusammengefuegt, null, 2), 'utf8');
console.log(`✅ Zusammengeführt in: ${zieldatei}`);