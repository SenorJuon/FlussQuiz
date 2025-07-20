const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Lies alle Flussnamen aus der Datei
const flussNamen = fs.readFileSync("fluesse.txt", "utf-8")
  .split("\n")
  .map((name) => name.trim())
  .filter(Boolean);

// Bounding Box für Deutschland (ungefähr)
const bbox = "(47.0,5.5,55.1,15.1)";

// Zielordner für GeoJSON-Dateien
const zielOrdner = "geojson";
if (!fs.existsSync(zielOrdner)) {
  fs.mkdirSync(zielOrdner);
}

async function ladeGeoJSON(flussName) {
  const query = `
  [out:json][timeout:30];
  (
    relation["name"="${flussName}"]["waterway"="river"]${bbox};
    way["name"="${flussName}"]["waterway"="river"]${bbox};
  );
  out geom;
  `;

  const url = "https://overpass-api.de/api/interpreter";

  try {
    const response = await axios.post(url, query, {
      headers: { "Content-Type": "text/plain" },
    });

    const data = response.data;

    if (!data.elements || data.elements.length === 0) {
      console.warn(`⚠️  Keine Daten für: ${flussName}`);
      return;
    }

    const features = data.elements
      .filter((el) => (el.type === "way" || el.type === "relation") && el.geometry)
      .map((el) => ({
        type: "Feature",
        properties: {
          id: el.id,
          name: flussName,
          tags: el.tags || {},
        },
        geometry: {
          type: "LineString",
          coordinates: el.geometry.map((pt) => [pt.lon, pt.lat]),
        },
      }));

    if (features.length === 0) {
      console.warn(`⚠️  Nur Elemente ohne Geometrie bei: ${flussName}`);
      return;
    }

    const geojson = {
      type: "FeatureCollection",
      features,
    };

    fs.writeFileSync(
      path.join(zielOrdner, `${flussName}.geojson`),
      JSON.stringify(geojson, null, 2)
    );

    console.log(`✅ ${flussName}: ${features.length} GeoJSON-Features gespeichert`);
  } catch (err) {
    console.error(`❌ Fehler bei ${flussName}:`, err.message);
  }
}

// Alle Flüsse durchgehen
(async () => {
  for (const name of flussNamen) {
    await ladeGeoJSON(name);
  }
})();