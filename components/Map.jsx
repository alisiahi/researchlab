"use client";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icons in Next.js
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
  });
}

function MapController({ setSelectedParcel }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.getContainer().style.cursor = "pointer"; // Ensure pointer cursor
    }
  }, [map]);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const tolerance = 0.00001;
      const bbox = `${lng - tolerance},${lat - tolerance},${lng + tolerance},${lat + tolerance}`;

      try {
        const response = await fetch(`/api/parcel?bbox=${bbox}`);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const p = feature.properties;

          // Mapping logic based on your provided ALKIS log
          const extracted = {
            kennzeichen: p.flstkennz || "N/A", // 1. Flurstückskennzeichen
            nummer: `${p.flstnrzae}${p.flstnrnen > 0 ? "/" + p.flstnrnen : ""}`, // 2. Flurstücksnummer (Zähler/Nenner)
            flur: p.flur || "N/A", // 3. Flurnummer
            gemarkung: p.gemarkung || "N/A", // 4. Gemarkung
            gemarkungSchluessel: p.gemaschl || "N/A", // 4. Gemarkungsschlüssel
            gemeinde: p.gemeinde || "N/A", // 5. Gemeinde
            lage: p.lagebeztxt || "N/A", // 6. Lagebezeichnung
            areaM2: parseFloat(p.flaeche || 0), // 7. Amtliche Fläche
            nutzung: p.tntxt ? p.tntxt.split(";")[0] : "N/A", // 8. Tatsächliche Nutzung (Text part)
          };

          setSelectedParcel({
            ...feature,
            extracted,
            displayAreaHa: (extracted.areaM2 / 10000).toFixed(4), // ha conversion
          });
        } else {
          setSelectedParcel(null);
        }
      } catch (error) {
        console.error("Error fetching parcel:", error);
      }
    },
  });
  return null;
}

const Map = () => {
  const [selectedParcel, setSelectedParcel] = useState(null);

  const highlightStyle = {
    color: "#ff3300",
    weight: 4,
    opacity: 0.9,
    fillColor: "#ff3300",
    fillOpacity: 0.25,
  };

  return (
    <div className="relative w-full h-[700px] border border-slate-200 rounded-xl overflow-hidden shadow-lg">
      {/* Information Panel based on official GeoBox requirements */}
      {selectedParcel && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur p-6 rounded-lg shadow-2xl border border-slate-100 w-[400px] max-h-[90%] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-slate-900 text-lg">
              KIWI Parcel Explorer
            </h3>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-slate-400 hover:text-red-500 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="bg-slate-50 p-2 rounded border-l-4 border-slate-300">
              <label className="text-[10px] text-slate-500 uppercase font-bold">
                1. Flurstückskennzeichen
              </label>
              <div className="font-mono text-xs text-slate-900">
                {selectedParcel.extracted.kennzeichen}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2 rounded">
                <label className="text-[10px] text-slate-500 uppercase font-bold">
                  2. Flurstücksnummer
                </label>
                <div className="font-mono text-xs text-slate-900">
                  {selectedParcel.extracted.nummer}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <label className="text-[10px] text-slate-500 uppercase font-bold">
                  3. Flurnummer
                </label>
                <div className="font-mono text-xs text-slate-900">
                  {selectedParcel.extracted.flur}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded">
              <label className="text-[10px] text-slate-500 uppercase font-bold">
                4. Gemarkung (Schlüssel)
              </label>
              <div className="font-mono text-xs text-slate-900">
                {selectedParcel.extracted.gemarkung} (
                {selectedParcel.extracted.gemarkungSchluessel})
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded">
              <label className="text-[10px] text-slate-500 uppercase font-bold">
                5. Gemeinde
              </label>
              <div className="font-mono text-xs text-slate-900">
                {selectedParcel.extracted.gemeinde}
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded">
              <label className="text-[10px] text-slate-500 uppercase font-bold">
                6. Lagebezeichnung
              </label>
              <div className="text-xs text-slate-900">
                {selectedParcel.extracted.lage}
              </div>
            </div>

            <div className="bg-blue-600 p-3 rounded text-white shadow-md">
              <label className="text-[10px] text-blue-200 uppercase font-bold">
                7. Amtliche Fläche
              </label>
              <div className="text-xl font-black">
                {selectedParcel.extracted.areaM2} m²
              </div>
              <div className="text-sm opacity-90">
                {selectedParcel.displayAreaHa} ha (Hectares)
              </div>
            </div>

            <div className="bg-slate-50 p-2 rounded">
              <label className="text-[10px] text-slate-500 uppercase font-bold">
                8. Tatsächliche Nutzung
              </label>
              <div className="text-xs text-slate-900">
                {selectedParcel.extracted.nutzung}
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[50.3493, 7.5843]}
        zoom={14}
        maxZoom={22}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={22}
          maxNativeZoom={19}
          attribution="&copy; OpenStreetMap"
        />

        <WMSTileLayer
          url="https://geo5.service24.rlp.de/wms/liegenschaften_rp.fcgi?"
          layers="Flurstueck,Hintergrund"
          format="image/png"
          transparent={true}
          version="1.3.0"
          maxZoom={22}
        />

        {selectedParcel && (
          <GeoJSON
            key={selectedParcel.extracted.kennzeichen}
            data={selectedParcel}
            style={highlightStyle}
          />
        )}

        <MapController setSelectedParcel={setSelectedParcel} />
      </MapContainer>
    </div>
  );
};

export default Map;
