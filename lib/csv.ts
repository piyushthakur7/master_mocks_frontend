// Shared CSV export used by the admin roster screens.
//
// Two things here are load-bearing and easy to get wrong:
//  1. Excel mangles a bare 9876543210 into 9.87654E+09 and silently drops
//     leading zeros and +91 prefixes. Phone columns must be forced to text.
//  2. Without a UTF-8 BOM, Excel opens the file in the system codepage and
//     turns Indian names into mojibake.

export type CsvColumn<T> = {
  key: keyof T;
  label: string;
  /** Force Excel to treat the value as text — required for phone numbers. */
  text?: boolean;
  /** Override the rendered value (dates, currency, computed fields). */
  format?: (row: T) => string;
};

export const csvCell = (value: unknown, forceText = false) => {
  const raw = value === null || value === undefined ? "" : String(value);
  const escaped = raw.replace(/"/g, '""');
  return forceText && raw ? `="${escaped}"` : `"${escaped}"`;
};

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) =>
          c.format ? csvCell(c.format(row), c.text) : csvCell(row[c.key], c.text)
        )
        .join(",")
    )
    .join("\r\n");
  return header + "\r\n" + body;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Stamps exports as enrollments-2026-08-17.csv */
export const datedFilename = (base: string) =>
  `${base}-${new Date().toISOString().slice(0, 10)}.csv`;
