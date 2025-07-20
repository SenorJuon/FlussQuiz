var checkBox = document.getElementById("deutschland");
let alleLayer = [];

var deutschlandBounds = L.latLngBounds(
  [47.0, 5.5], // Südwest
  [55.1, 15.1] // Nordost
);

var map = L.map("map", {
  maxBounds: deutschlandBounds,
  maxBoundsViscosity: 1.0,
  minZoom: 6.4,
  maxZoom: 18,
}).setView([51.1657, 10.4515], 6);

L.tileLayer(
  "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=34xAAXrLXzTo34pOtGai",
  {
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  }
).addTo(map);

// Lade GeoJSON-Daten beim Start
/*fetch("alle_fluesse_deutschland.geojson")
  .then((res) => res.json())
  .then((data) => {
    alleFluesseGeoJSON = data;
});*/

var errateneFluesse = [];
let spielLaeuft = false;
let alleFluesseGeoJSON;
let flussLayer;
let aufgedecktLayer;
//let errateneLayer;

function sucheFluss() {
  if (!spielLaeuft || !alleFluesseGeoJSON) return;
  const eingabe = document
    .getElementById("rateFeld")
    .value.trim()
    .toLowerCase();
  const label = document.getElementById("label");
  label.innerText = "";

  if (errateneFluesse.includes(eingabe)) {
    label.innerText = "Fluss bereits erraten!";
    return;
  }
  /*if (flussLayer) {                   //später hinzufügen. Der Fluss der grad erraten wurde gelb, die anderen schon erratenen Grün
    map.removeLayer(flussLayer);
    flussLayer = null;
  }*/

  // Suche nach passendem Namen (exakter Match)
  const gefunden = alleFluesseGeoJSON.features.filter(
    (f) =>
      f.properties &&
      f.properties.name &&
      f.properties.name.toLowerCase() === eingabe
  );

  if (gefunden.length > 0) {
    flussLayer = L.geoJSON(gefunden, {
      style: {
        color: "green",
        weight: 4,
      },
    }).addTo(map);
    alleLayer.push(flussLayer);

    //map.fitBounds(flussLayer.getBounds());
    errateneFluesse.push(eingabe);
    console.log("Richtig geraten:", eingabe);
    const liste = document.getElementById("erratenListe");
    const neuerEintrag = document.createElement("li");
    neuerEintrag.textContent = capitalize(eingabe);
    liste.appendChild(neuerEintrag);
    document.getElementById("rateFeld").value = "";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function startAufgeben() {
  console.log("Knopf gedrückt!");
  const button = document.getElementById("startAufgebeButton");
  const input = document.getElementById("rateFeld");

  // Wenn Button nicht aktiv ist → aktivieren
  if (!button.classList.contains("active")) {
    /* if (aufgedecktLayer) {
      map.removeLayer(aufgedecktLayer);
      aufgedecktLayer = null;
    }

    if (flussLayer) {
      map.removeLayer(flussLayer);
      flussLayer = null;
    }*/
    alleLayer.forEach(layer => {
      map.removeLayer(layer);
    });
    alleLayer = [];
    errateneFluesse = [];
    document.getElementById("erratenListe").innerHTML = "";
    const geojsonDatei = checkBox.checked
      ? "alle_fluesse_welt.geojson"
      : "alle_fluesse_deutschland.geojson";

    fetch(geojsonDatei)
      .then((res) => res.json())
      .then((data) => {
        alleFluesseGeoJSON = data;

        console.log("Spiel gestartet mit:", geojsonDatei);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der GeoJSON:", err);
      });
    spielLaeuft = true; //initialen Einstellungen
    input.disabled = false; //also sowas wie Liste leeren und so
    input.focus();
    checkBox.disabled = true;
    button.classList.add("active");
    button.textContent = "Aufgeben";

  } else {
    // Wieder zurücksetzen
    spielLaeuft = false;
    button.classList.remove("active");
    button.textContent = "Starten";
    input.disabled = true;
    checkBox.disabled = false;

    var name;
    const nochNichtErraten = alleFluesseGeoJSON.features.filter((f) => {
      name =
        f.properties && f.properties.name && f.properties.name.toLowerCase();
      return name && !errateneFluesse.includes(name);
    });

    aufgedecktLayer = L.geoJSON(nochNichtErraten, {
      style: {
        color: "red",
        weight: 2,
        // dashArray: "5,5",
      },
    }).addTo(map);
    alleLayer.push(aufgedecktLayer);

    /*if(!errateneFluesse.includes(name)){
      const neuerEintrag = document.createElement("li");
      neuerEintrag.classList.add("nichtErratenListe");
      neuerEintrag.textContent = capitalize(name);
      liste.appendChild(neuerEintrag);
      }*/

    const liste = document.getElementById("erratenListe");
    const bereitsHinzugefuegt = new Set();

    nochNichtErraten.forEach((f) => {
      const name = f.properties?.name;
      if (name && !bereitsHinzugefuegt.has(name)) {
        bereitsHinzugefuegt.add(name);

        const neuerEintrag = document.createElement("li");
        neuerEintrag.classList.add("nichtErratenListe");
        neuerEintrag.textContent = capitalize(name);
        liste.appendChild(neuerEintrag);
      }
    });

    //map.fitBounds(aufgedecktLayer.getBounds());
  }
}
/*function normalizeName(name) {
  return name
  //.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}*/

function checkboxClicked() {
  if (checkBox.checked) {
    // dann soll die Weltangezeigt werden, sonst nur deutschland mit den deutschland daten
    map.setView([0, 0], 1);
    map.setMaxBounds(null); // keine Begrenzung
    map.options.minZoom = 2;
    map.setZoom(2);
  } else {
    // Deutschland zurücksetzen
    const deutschlandBounds = L.latLngBounds([47.0, 5.5], [55.1, 15.1]);
    map.setMaxBounds(deutschlandBounds);
    map.setView([51.1657, 10.4515], 6.4);
    map.options.minZoom = 6.4;
    map.setZoom(6.4);
  }
}
