"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import ApplicationForm from "../components/ApplicationForm"; // Ensure the path is correct

// Dynamically import Map (No SSR for Leaflet)
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      Lade Karte...
    </div>
  ),
});

export default function Home() {
  // 1. Logic: Keep track of which view we are in
  const [view, setView] = useState("map");

  // 2. Logic: Keep the parcel list here so it doesn't vanish when we switch views
  const [savedParcels, setSavedParcels] = useState([]);

  const handleFinishSelection = () => {
    if (savedParcels.length > 0) {
      setView("form");
    } else {
      alert("Bitte wählen Sie zuerst mindestens ein Flurstück aus.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">
          Drohnen-Anwendungsplan 2025
        </h1>

        {view === "map" ? (
          <div className="space-y-6">
            {/* Pass the state and the finish function as PROPS to the Map */}
            <Map
              savedParcels={savedParcels}
              setSavedParcels={setSavedParcels}
              onFinish={handleFinishSelection}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setView("map")}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4"
            >
              ← Zurück zur Karte (Flurstücke bearbeiten)
            </button>

            {/* Show the application form for the 9 Sprayings  */}
            <ApplicationForm selectedParcels={savedParcels} />
          </div>
        )}
      </div>
    </main>
  );
}
