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

// Fix Leaflet icons in Next.js
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

// 📍 Controller for map click
function MapController({ setSelectedParcel }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.getContainer().style.cursor = "pointer";
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

          const extracted = {
            kennzeichen: p.flstkennz || "N/A",
            nummer: `${p.flstnrzae}${p.flstnrnen > 0 ? "/" + p.flstnrnen : ""}`,
            flur: p.flur || "N/A",
            gemarkung: p.gemarkung || "N/A",
            gemarkungSchluessel: p.gemaschl || "N/A",
            gemeinde: p.gemeinde || "N/A",
            lage: p.lagebeztxt || "N/A",
            areaM2: parseFloat(p.flaeche || 0),
            nutzung: p.tntxt ? p.tntxt.split(";")[0] : "N/A",
          };

          setSelectedParcel({
            ...feature,
            extracted,
            displayAreaHa: (extracted.areaM2 / 10000).toFixed(4),
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

// ✅ Updated: Props passed from page.jsx
const Map = ({ savedParcels, setSavedParcels, onFinish }) => {
  const [selectedParcel, setSelectedParcel] = useState(null);

  // ✅ Add parcel to the shared list
  const addParcelToList = () => {
    if (!selectedParcel) return;

    const exists = savedParcels.some(
      (p) => p.extracted.kennzeichen === selectedParcel.extracted.kennzeichen,
    );

    if (!exists) {
      setSavedParcels([...savedParcels, selectedParcel]);
    }

    setSelectedParcel(null);
  };

  const highlightStyle = {
    color: "#ff3300",
    weight: 4,
    opacity: 0.9,
    fillColor: "#ff3300",
    fillOpacity: 0.25,
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[700px] border border-slate-200 rounded-xl overflow-hidden shadow-lg">
        {/* 📦 Popup */}
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

            <button
              onClick={addParcelToList}
              className="mb-4 w-full bg-green-600 cursor-pointer hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded shadow transition-colors"
            >
              Zur Liste hinzufügen
            </button>

            <div className="grid gap-3 text-sm text-black">
              <div className="bg-slate-50 p-2 rounded">
                <b>Kennzeichen:</b> {selectedParcel.extracted.kennzeichen}
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <b>Flurstück:</b> {selectedParcel.extracted.nummer}
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <b>Gemarkung:</b> {selectedParcel.extracted.gemarkung}
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <b>Gemeinde:</b> {selectedParcel.extracted.gemeinde}
              </div>
              <div className="bg-blue-600 text-white p-3 rounded">
                <b>Fläche:</b> {selectedParcel.extracted.areaM2} m² (
                {selectedParcel.displayAreaHa} ha)
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <b>Nutzung:</b> {selectedParcel.extracted.nutzung}
              </div>
            </div>
          </div>
        )}

        {/* 🗺️ Map */}
        <MapContainer
          center={[50.3493, 7.5843]}
          zoom={14}
          maxZoom={22}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}
          />

          <WMSTileLayer
            url="https://geo5.service24.rlp.de/wms/liegenschaften_rp.fcgi?"
            layers="Flurstueck,Hintergrund"
            format="image/png"
            transparent={true}
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

      {/* 📋 TABLE & FINISH ACTION */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            Ausgewählte Flurstücke
          </h2>

          {/* ✅ FINISH BUTTON: Triggered once parcels are selected */}
          {savedParcels.length > 0 && (
            <button
              onClick={onFinish}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-all active:scale-95"
            >
              Auswahl bestätigen & Weiter →
            </button>
          )}
        </div>

        {savedParcels.length === 0 ? (
          <p className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg border-slate-200">
            Klicken Sie auf die Karte, um Flurstücke für Ihren Anwendungsplan
            auszuwählen.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 border-b text-left">Kennzeichen</th>
                  <th className="p-3 border-b text-left">Flurstück</th>
                  <th className="p-3 border-b text-left">Gemarkung</th>
                  <th className="p-3 border-b text-left">Gemeinde</th>
                  <th className="p-3 border-b text-right">Fläche</th>
                  <th className="p-3 border-b text-center">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {savedParcels.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 border-b font-mono">
                      {p.extracted.kennzeichen}
                    </td>
                    <td className="p-3 border-b">{p.extracted.nummer}</td>
                    <td className="p-3 border-b">{p.extracted.gemarkung}</td>
                    <td className="p-3 border-b">{p.extracted.gemeinde}</td>
                    <td className="p-3 border-b text-right">
                      {p.extracted.areaM2} m²
                    </td>
                    <td className="p-3 border-b text-center">
                      <button
                        onClick={() =>
                          setSavedParcels(
                            savedParcels.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Entfernen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
