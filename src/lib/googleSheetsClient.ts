// src/lib/googleSheetsClient.ts

export interface SpreadsheetMeta {
  properties: {
    title: string;
  };
  sheets: {
    properties: {
      sheetId: number;
      title: string;
    };
  }[];
}

export async function getSpreadsheetMeta(sheetId: string, apiKey: string): Promise<SpreadsheetMeta> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Gagal mengambil metadata dari Google Sheets");
  }
  
  return response.json();
}

export async function fetchSheetRange(sheetId: string, apiKey: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Gagal mengambil data dari range: ${range}`);
  }
  
  const data = await response.json();
  return data.values || [];
}