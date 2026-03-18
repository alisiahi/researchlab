"use client";
import dynamic from "next/dynamic";

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Drone Permit MVP - RLP Map
        </h1>

        <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
          <Map />
        </div>

        <p className="mt-4 text-center text-gray-600">
          Source: ©GeoBasis-DE / LVermGeoRP, dl-de/by-2-0
        </p>
      </div>
    </main>
  );
}
