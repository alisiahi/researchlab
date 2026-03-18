"use client";

export default function ParcelList({ parcels }) {
  if (!parcels || parcels.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500">
        Keine gespeicherten Flurstücke.
      </div>
    );
  }

  return (
    <div className="mt-8 w-full overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Meine Liste</h2>

      <table className="w-full border border-slate-200 rounded-lg overflow-hidden text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 border">Kennzeichen</th>
            <th className="p-2 border">Flurstück</th>
            <th className="p-2 border">Gemarkung</th>
            <th className="p-2 border">Gemeinde</th>
            <th className="p-2 border">Fläche (m²)</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((p, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border font-mono">
                {p.extracted.kennzeichen}
              </td>
              <td className="p-2 border">{p.extracted.nummer}</td>
              <td className="p-2 border">{p.extracted.gemarkung}</td>
              <td className="p-2 border">{p.extracted.gemeinde}</td>
              <td className="p-2 border">{p.extracted.areaM2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
