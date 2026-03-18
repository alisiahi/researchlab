import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get("bbox");

  // Modern OGC API Features endpoint for high-detail parcel data
  const url = `https://www.geoportal.rlp.de/spatial-objects/519/collections/ave:Flurstueck/items?bbox=${bbox}&limit=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/geo+json",
        Referer: "https://www.geoportal.rlp.de", // Essential for RLP Geo5 servers
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Server error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
