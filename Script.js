var bounds = L.latLngBounds(
  [47.0, 5.5], // Südwest
  [55.1, 15.1] // Nordost
);

var map = L.map("map", {
  maxBounds: bounds,
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

/*fetch('donau.geojson')
    .then(response => response.json())
    .then(data => {
      const donauLayer = L.geoJSON(data, {
        style: {
          color: feature.properties.name === "Donau" ? "blue" : "gray",
          weight: 3
        }
      }).addTo(map);

      // automatisch an Donau zoomen
      map.fitBounds(donauLayer.getBounds());
    })
    .catch(err => {
      console.error('Fehler beim Laden der GeoJSON-Datei:', err);
    });*/

// Lade GeoJSON-Daten beim Start
fetch("alle_fluesse.geojson")
  .then((res) => res.json())
  .then((data) => {
    alleFluesseGeoJSON = data;
  });

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

    map.fitBounds(flussLayer.getBounds());
    errateneFluesse.push(eingabe);
    console.log("Richtig geraten:", eingabe);
    const liste = document.getElementById("erratenListe");
    const neuerEintrag = document.createElement("li");
    neuerEintrag.textContent = capitalize(eingabe);
    liste.appendChild(neuerEintrag);
    document.getElementById("rateFeld").value = "";

    /*for (let i = 0; i<= errateneFluesse.length; i++){
      let alteFluss = errateneFluesse[i]
      errateneLayer = L.geoJSON(alteFluss, {
        style: {
          color: "green",
          weight: 4,
        },
      }).addTo(map);
    }*/
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
    spielLaeuft = true; //initialen Einstellungen
    input.disabled = false; //also sowas wie Liste leeren und so
    input.focus();
    errateneFluesse = [];
    document.getElementById("erratenListe").innerHTML = "";
    button.classList.add("active");
    button.textContent = "Aufgeben";

    if (aufgedecktLayer) {
      map.removeLayer(aufgedecktLayer);
      aufgedecktLayer = null;
    }

    if (flussLayer) {
      map.removeLayer(flussLayer);
      flussLayer = null;
    }
  } else {
    // Wieder zurücksetzen
    spielLaeuft = false;
    button.classList.remove("active");
    button.textContent = "Starten";
    input.disabled = true;

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
        dashArray: "5,5",
      },
    }).addTo(map);

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
