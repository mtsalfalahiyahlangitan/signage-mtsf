// src/app/api/sheets/route.ts
import { NextResponse } from "next/server";
import { getSignageData } from "@/lib/googleSheets";

export const revalidate = 30; // cache 30 detik di server

export async function GET() {
  try {
    const data = await getSignageData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}