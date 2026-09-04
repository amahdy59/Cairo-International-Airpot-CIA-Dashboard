import { notifyManager } from "./toast";

export interface CsvExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  successMessage?: { en: string; ar: string };
  language?: "en" | "ar";
}

/**
 * Exports tabular data to a downloadable CSV file.
 * Includes UTF-8 Byte Order Mark (\uFEFF) to ensure Microsoft Excel correctly renders Arabic script.
 */
export function exportToCsv({
  filename,
  headers,
  rows,
  successMessage,
  language = "en",
}: CsvExportOptions): void {
  const escapeCell = (cell: string | number): string => {
    const stringValue = cell === null || cell === undefined ? "" : String(cell);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n") || stringValue.includes("\r")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  // \uFEFF is UTF-8 BOM for Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const title = language === "ar" ? "تم تصدير التقرير بنجاح" : "Report Exported Successfully";
  const desc = successMessage
    ? successMessage[language]
    : language === "ar"
    ? `تم حفظ الملف: ${cleanFilename}`
    : `Saved file: ${cleanFilename}`;

  notifyManager(title, desc, "ok");
}
