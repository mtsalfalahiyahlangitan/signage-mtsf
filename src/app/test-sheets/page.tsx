"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Play,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Loader2,
  TableProperties,
  KeyRound,
  FileSpreadsheet,
  Info,
} from "lucide-react";
// Pastikan path ini sesuai dengan letak file googleSheetsClient.ts Anda
import { fetchSheetRange, getSpreadsheetMeta, type SpreadsheetMeta } from "@/lib/googleSheetsClient";

type Status = "idle" | "loading" | "success" | "error";

interface TestResult {
  status: Status;
  message: string;
  data?: string[][];
  sheetMeta?: SpreadsheetMeta;
}

const REQUIRED_SHEETS = [
  { name: "Infografis", range: "Infografis!A:F", cols: ["ID", "Judul", "URL Gambar", "Durasi", "—", "Status"] },
  { name: "Pengumuman", range: "Pengumuman!A:F", cols: ["ID", "Tanggal", "Judul", "Isi", "Status", "Durasi"] },
  { name: "RunningText", range: "RunningText!A:C", cols: ["ID", "Teks", "Status"] },
  { name: "StatistikPerKelas", range: "StatistikPerKelas!A:E", cols: ["ID", "Kelas", "Jumlah", "Status", "Tingkat"] },
  { name: "JadwalHarian", range: "JadwalHarian!A:F", cols: ["ID", "Label", "Jam Mulai", "Jam Selesai", "Status", "Mapel"] },
  { name: "Konfigurasi", range: "Konfigurasi!A:B", cols: ["Key", "Value"] },
];

export default function GoogleSheetsTester() {
  const [sheetId, setSheetId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedRange, setSelectedRange] = useState("Konfigurasi!A:B");
  const [customRange, setCustomRange] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [metaResult, setMetaResult] = useState<TestResult>({ status: "idle", message: "" });
  const [fetchResult, setFetchResult] = useState<TestResult>({ status: "idle", message: "" });
  const [sheetChecks, setSheetChecks] = useState<Record<string, "idle" | "loading" | "ok" | "missing">>(
    Object.fromEntries(REQUIRED_SHEETS.map(s => [s.name, "idle"]))
  );
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const effectiveRange = useCustom ? customRange : selectedRange;

  // ─── 1. Test koneksi dasar (ambil metadata spreadsheet) ─────────────
  async function handleTestConnection() {
    if (!sheetId.trim() || !apiKey.trim()) return;
    setMetaResult({ status: "loading", message: "Menghubungi Google Sheets API..." });
    setFetchResult({ status: "idle", message: "" });
    try {
      const meta = await getSpreadsheetMeta(sheetId.trim(), apiKey.trim());
      setMetaResult({
        status: "success",
        message: `Berhasil terhubung ke: "${meta.properties.title}"`,
        sheetMeta: meta,
      });
    } catch (e) {
      setMetaResult({
        status: "error",
        message: (e as Error).message,
      });
    }
  }

  // ─── 2. Ambil data dari range tertentu ───────────────────────────────
  async function handleFetchRange() {
    if (!sheetId.trim() || !apiKey.trim() || !effectiveRange.trim()) return;
    setFetchResult({ status: "loading", message: `Mengambil data dari ${effectiveRange}...` });
    try {
      const data = await fetchSheetRange(sheetId.trim(), apiKey.trim(), effectiveRange.trim());
      setFetchResult({
        status: "success",
        message: `${data.length} baris ditemukan di range "${effectiveRange}"`,
        data,
      });
      setExpandedRows({});
    } catch (e) {
      setFetchResult({
        status: "error",
        message: (e as Error).message,
        data: undefined,
      });
    }
  }

  // ─── 3. Cek semua sheet yang diperlukan ──────────────────────────────
  async function handleCheckAllSheets() {
    if (!sheetId.trim() || !apiKey.trim()) return;
    const init = Object.fromEntries(REQUIRED_SHEETS.map(s => [s.name, "loading" as const]));
    setSheetChecks(init);
    await Promise.all(
      REQUIRED_SHEETS.map(async (s) => {
        try {
          const rows = await fetchSheetRange(sheetId.trim(), apiKey.trim(), s.range);
          setSheetChecks((prev) => ({ ...prev, [s.name]: rows.length > 0 ? "ok" : "missing" }));
        } catch {
          setSheetChecks((prev) => ({ ...prev, [s.name]: "missing" }));
        }
      })
    );
  }

  const isReady = sheetId.trim().length > 0 && apiKey.trim().length > 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Signage
        </Link>
        <div className="w-px h-5 bg-stone-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Database size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-stone-800 text-base" style={{ fontWeight: 700 }}>
              Google Sheets Connection Tester
            </h1>
            <p className="text-stone-400 text-xs">Uji koneksi ke Google Sheets tanpa perlu backend</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* ── Panduan setup ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="text-blue-800 text-sm" style={{ fontWeight: 600 }}>Cara mendapatkan Sheet ID & API Key</p>
              <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside">
                <li>
                  <strong>Sheet ID:</strong> Dari URL Google Sheets: <code className="bg-blue-100 px-1 rounded">https://docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit</code>
                </li>
                <li>
                  <strong>API Key:</strong> Buka <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink size={10} /></a> → APIs & Services → Credentials → Create API Key
                </li>
                <li>Aktifkan <strong>Google Sheets API</strong> di Library API</li>
                <li>Pastikan spreadsheet di-share ke <strong>"Anyone with the link"</strong> (Viewer)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ── Form Kredensial ── */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={15} className="text-stone-400" />
            <h2 className="text-stone-700 text-sm" style={{ fontWeight: 700 }}>Kredensial Google Sheets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 text-xs mb-1.5" style={{ fontWeight: 600 }}>
                Spreadsheet ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..."
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 font-mono bg-stone-50"
                />
                <button
                  onClick={() => copyToClipboard(sheetId)}
                  className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
                  title="Salin"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 text-xs mb-1.5" style={{ fontWeight: 600 }}>
                API Key <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSyB..."
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 font-mono bg-stone-50"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
                  title="Salin"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={!isReady || metaResult.status === "loading"}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm px-5 py-2 rounded-lg transition-colors"
            style={{ fontWeight: 600 }}
          >
            {metaResult.status === "loading" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Play size={15} />
            )}
            Test Koneksi
          </button>

          {/* Status koneksi */}
          {metaResult.status !== "idle" && metaResult.status !== "loading" && (
            <StatusAlert status={metaResult.status} message={metaResult.message} />
          )}

          {/* Daftar sheet yang ditemukan */}
          {metaResult.sheetMeta && (
            <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-stone-600 text-xs mb-2" style={{ fontWeight: 600 }}>
                Sheet ditemukan ({metaResult.sheetMeta.sheets.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {metaResult.sheetMeta.sheets.map((s) => (
                  <button
                    key={s.properties.sheetId}
                    onClick={() => {
                      setSelectedRange(`${s.properties.title}!A:Z`);
                      setUseCustom(false);
                    }}
                    className="text-xs px-2 py-1 bg-white border border-stone-200 rounded-md hover:border-red-300 hover:text-red-600 transition-colors text-stone-600 font-mono"
                  >
                    {s.properties.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Cek Tab yang Diperlukan ── */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties size={15} className="text-stone-400" />
              <h2 className="text-stone-700 text-sm" style={{ fontWeight: 700 }}>Cek Tab yang Diperlukan</h2>
            </div>
            <button
              onClick={handleCheckAllSheets}
              disabled={!isReady}
              className="flex items-center gap-1.5 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-600 px-3 py-1.5 rounded-lg transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Search size={12} />
              Cek Semua Tab
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {REQUIRED_SHEETS.map((s) => {
              const st = sheetChecks[s.name];
              return (
                <div
                  key={s.name}
                  className={`flex items-start gap-2 p-3 rounded-lg border text-xs transition-colors ${
                    st === "ok"
                      ? "bg-green-50 border-green-200"
                      : st === "missing"
                      ? "bg-red-50 border-red-200"
                      : st === "loading"
                      ? "bg-stone-50 border-stone-200"
                      : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {st === "loading" && <Loader2 size={13} className="animate-spin text-stone-400" />}
                    {st === "ok" && <CheckCircle2 size={13} className="text-green-500" />}
                    {st === "missing" && <XCircle size={13} className="text-red-500" />}
                    {st === "idle" && <div className="w-3 h-3 rounded-full border-2 border-stone-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-mono ${st === "ok" ? "text-green-700" : st === "missing" ? "text-red-700" : "text-stone-600"}`} style={{ fontWeight: 700 }}>
                      {s.name}
                    </p>
                    <p className="text-stone-400 mt-0.5 truncate">{s.range}</p>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {s.cols.map((c, i) => (
                        <span key={i} className="bg-stone-100 text-stone-500 px-1 rounded text-[9px] font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Fetch Data Range ── */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet size={15} className="text-stone-400" />
            <h2 className="text-stone-700 text-sm" style={{ fontWeight: 700 }}>Ambil Data dari Range</h2>
          </div>

          {/* Pilih range */}
          <div className="flex flex-wrap gap-2">
            {/* Preset tabs */}
            {REQUIRED_SHEETS.map((s) => (
              <button
                key={s.name}
                onClick={() => { setSelectedRange(s.range); setUseCustom(false); }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-mono ${
                  !useCustom && selectedRange === s.range
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:border-red-300 hover:text-red-600"
                }`}
                style={{ fontWeight: !useCustom && selectedRange === s.range ? 700 : 500 }}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                useCustom
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
              style={{ fontWeight: useCustom ? 700 : 500 }}
            >
              Custom Range
            </button>
          </div>

          {/* Input custom range */}
          {useCustom && (
            <div>
              <label className="block text-stone-600 text-xs mb-1.5" style={{ fontWeight: 600 }}>
                Custom Range (contoh: Sheet1!A1:D20)
              </label>
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="Konfigurasi!A:B"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 font-mono bg-stone-50"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-500">
              Range: <span className="text-stone-800" style={{ fontWeight: 600 }}>{effectiveRange || "—"}</span>
            </div>
            <button
              onClick={handleFetchRange}
              disabled={!isReady || !effectiveRange.trim() || fetchResult.status === "loading"}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{ fontWeight: 600 }}
            >
              {fetchResult.status === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Ambil Data
            </button>
          </div>

          {/* Status */}
          {fetchResult.status !== "idle" && fetchResult.status !== "loading" && (
            <StatusAlert status={fetchResult.status} message={fetchResult.message} />
          )}

          {/* Tabel hasil */}
          {fetchResult.data && fetchResult.data.length > 0 && (
            <DataTable data={fetchResult.data} expandedRows={expandedRows} setExpandedRows={setExpandedRows} />
          )}
          {fetchResult.status === "success" && fetchResult.data?.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-stone-50 rounded-lg border border-stone-200 text-sm text-stone-500">
              <AlertCircle size={15} className="text-stone-400" />
              Range ditemukan tapi tidak ada data. Pastikan sheet tidak kosong.
            </div>
          )}
        </div>

        {/* ── Petunjuk Env Vars ── */}
        <div className="bg-stone-800 rounded-xl p-5">
          <p className="text-stone-300 text-xs mb-3" style={{ fontWeight: 700 }}>
            Setelah berhasil — simpan kredensial ke environment variable (di file .env.local):
          </p>
          <div className="bg-stone-900 rounded-lg p-4 font-mono text-xs space-y-1">
            <p>
              <span className="text-stone-500"># .env.local (di root project)</span>
            </p>
            <p>
              <span className="text-green-400">GOOGLE_SHEET_ID</span>
              <span className="text-stone-400">=</span>
              <span className="text-yellow-300">{sheetId || "paste_sheet_id_anda_disini"}</span>
            </p>
            <p>
              <span className="text-green-400">GOOGLE_SHEETS_API_KEY</span>
              <span className="text-stone-400">=</span>
              <span className="text-yellow-300">{apiKey ? "***" : "paste_api_key_anda_disini"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusAlert({ status, message }: { status: "success" | "error"; message: string }) {
  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
        status === "success"
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-700"
      }`}
    >
      {status === "success" ? (
        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
      ) : (
        <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
      )}
      <span>{message}</span>
    </div>
  );
}

function DataTable({
  data,
  expandedRows,
  setExpandedRows,
}: {
  data: string[][];
  expandedRows: Record<number, boolean>;
  setExpandedRows: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  const header = data[0] ?? [];
  const rows = data.slice(1);

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <span className="text-stone-600 text-xs" style={{ fontWeight: 600 }}>
          {data.length} baris ({rows.length} data + 1 header)
        </span>
        <span className="text-stone-400 text-xs">{header.length} kolom</span>
      </div>
      <div className="overflow-x-auto" style={{ maxHeight: "360px", overflowY: "auto" }}>
        <table className="w-full text-xs">
          <thead className="bg-stone-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-stone-500 font-mono" style={{ fontWeight: 600 }}>
                #
              </th>
              {header.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-stone-600 font-mono whitespace-nowrap" style={{ fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isExpanded = expandedRows[ri];
              return (
                <tr
                  key={ri}
                  className="border-t border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedRows((prev) => ({ ...prev, [ri]: !prev[ri] }))
                  }
                >
                  <td className="px-3 py-2 text-stone-400 font-mono">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown size={11} />
                      ) : (
                        <ChevronRight size={11} />
                      )}
                      {ri + 1}
                    </div>
                  </td>
                  {header.map((_, ci) => (
                    <td key={ci} className="px-3 py-2 text-stone-600 font-mono">
                      <div
                        className={`${
                          isExpanded ? "whitespace-pre-wrap break-words" : "truncate"
                        }`}
                        style={{ maxWidth: isExpanded ? "none" : "200px" }}
                      >
                        {row[ci] ?? (
                          <span className="text-stone-300 italic">—</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}