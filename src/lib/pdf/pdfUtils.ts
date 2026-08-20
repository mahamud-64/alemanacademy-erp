// src/lib/pdf/pdfUtils.ts

/**
 * Shared PDF utilities.
 *
 * This file is intentionally independent from the result page.
 * Future PDFs such as Routine PDF can reuse these helpers.
 */

/* ============================================================
   BANGLA DIGITS
============================================================ */

export function toBanglaDigits(
  value: string | number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).replace(
    /\d/g,
    (digit) =>
      "০১২৩৪৫৬৭৮৯"[Number(digit)],
  );
}

/* ============================================================
   PDF MARK
============================================================ */

/**
 * IMPORTANT:
 *
 * PDF ONLY:
 *
 * Normal mark -> actual mark
 * Absent       -> X
 * Missing      -> X
 *
 * We intentionally DO NOT output "A" for absent
 * because A is already an academic grade.
 */
export function formatPdfMark(
  value: number | null | undefined,
  isAbsent = false,
): string {
  if (
    isAbsent ||
    value === null ||
    value === undefined
  ) {
    return "X";
  }

  return toBanglaDigits(value);
}

/* ============================================================
   GPA
============================================================ */

export function formatPdfGpa(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "X";
  }

  return value.toFixed(2);
}

/* ============================================================
   GRADE
============================================================ */

export function formatPdfGrade(
  value: string | null | undefined,
): string {
  if (!value) {
    return "X";
  }

  return value;
}

/* ============================================================
   SAFE FILE NAME
============================================================ */

export function safePdfFileName(
  value: string,
): string {
  return value
    .replace(
      /[\\/:*?"<>|]/g,
      "",
    )
    .replace(/\s+/g, "_")
    .trim();
}

/* ============================================================
   ESCAPE HTML
============================================================ */

export function escapeHtml(
  value: unknown,
): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   WAIT
============================================================ */

export function wait(
  milliseconds: number,
): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

/* ============================================================
   IMAGE READY
============================================================ */

export async function waitForImages(
  container: HTMLElement,
): Promise<void> {
  const images =
    Array.from(
      container.querySelectorAll("img"),
    );

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );
}

/* ============================================================
   SHARED PDF COLORS
============================================================ */

export const PDF_COLORS = {
  green: "#006B4F",
  darkGreen: "#004D3A",
  lightGreen: "#EEF7F2",
  border: "#7A8F87",
  gold: "#C9A227",
  black: "#111827",
  gray: "#64748B",
  lightGray: "#F8FAFC",
  white: "#FFFFFF",
} as const;