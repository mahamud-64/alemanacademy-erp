// src/lib/pdf/meritListPdf.ts

import logo from "@/assets/logo.png";

import {
  safePdfFileName,
  toBanglaDigits,
} from "./pdfUtils";

/* ============================================================
   TYPES
============================================================ */

export type MeritListRow = {
  enrollment: {
    id: string;
    roll?: number | string | null;
  };

  student: {
    student_id?: string | null;
    student_name: string;
  };

  marks: Record<string, number | null>;

  absent?: Record<string, boolean>;

  total: number | null;

  grade: string;

  gpa: number | null;

  position: number | null;

  complete: boolean;
};

export type GenerateMeritListPdfOptions = {
  resultRows: MeritListRow[];

  className: string;

  classLabel: string;

  section?: string;

  examName: string;

  academicYear: string;

  schoolName?: string;

  schoolAddress?: string;

  logoUrl?: string;
};

/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHtml(
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
   POSITION
============================================================ */

function formatPosition(
  position: number | null,
): string {
  if (
    position === null ||
    position === undefined
  ) {
    return "X";
  }

  return toBanglaDigits(position);
}

/* ============================================================
   TOTAL
============================================================ */

function formatTotal(
  total: number | null,
): string {
  if (
    total === null ||
    total === undefined
  ) {
    return "X";
  }

  return toBanglaDigits(total);
}

/* ============================================================
   GRADE
============================================================ */

function formatGrade(
  grade: string | null | undefined,
): string {
  if (!grade) {
    return "X";
  }

  return grade;
}

/* ============================================================
   RESULT ORDER
============================================================ */

/*
 * Official leaderboard ordering:
 *
 * 1. Valid merit position first
 * 2. Lower merit position first
 * 3. Students without a position go after ranked students
 *
 * This does NOT recalculate merit.
 * It uses the position already calculated by
 * PublishResultsManager.
 */

function sortMeritRows(
  rows: MeritListRow[],
): MeritListRow[] {
  return [...rows].sort((a, b) => {
    const rollA = Number(a.enrollment.roll);
    const rollB = Number(b.enrollment.roll);

    const validA = Number.isFinite(rollA);
    const validB = Number.isFinite(rollB);

    if (validA && validB) {
      return rollA - rollB;
    }

    if (validA) return -1;
    if (validB) return 1;

    return 0;
  });
}

/* ============================================================
   TABLE ROW
============================================================ */

function buildMeritRow(
  row: MeritListRow,
  index: number,
): string {

  return `
    <tr>

      <!-- Serial -->

      <td class="serial-cell">
        ${toBanglaDigits(
          index + 1,
        )}
      </td>


      <!-- Student -->

      <td class="student-cell">

        <div class="student-name">
          ${escapeHtml(
            row.student.student_name,
          )}
        </div>

        ${
          row.student.student_id
            ? `
              <div class="student-id">
                ${escapeHtml(
                  row.student.student_id,
                )}
              </div>
            `
            : ""
        }

      </td>


      <!-- Total -->

      <td class="total-cell">
        ${formatTotal(
          row.total,
        )}
      </td>


      <!-- Grade -->

      <td class="grade-cell">
        ${formatGrade(
          row.grade,
        )}
      </td>


      <!-- Position -->

      <td class="position-cell">
        ${formatPosition(
          row.position,
        )}
      </td>

    </tr>
  `;
}

/* ============================================================
   TABLE
============================================================ */

function buildMeritTable(
  rows: MeritListRow[],
): string {

  return `
    <table class="merit-table">

      <colgroup>

        <col class="serial-column" />

        <col class="student-column" />

        <col class="total-column" />

        <col class="grade-column" />

        <col class="position-column" />

      </colgroup>


      <thead>

        <tr>

          <th>
            ক্র. নং
          </th>

          <th>
            পরীক্ষার্থীর নাম
          </th>

          <th>
            সর্বমোট
          </th>

          <th>
            গ্রেড
          </th>

          <th>
            অবস্থান
          </th>

        </tr>

      </thead>


      <tbody>

        ${rows
          .map(
            (row, index) =>
              buildMeritRow(
                row,
                index,
              ),
          )
          .join("")}

      </tbody>

    </table>
  `;
}

/* ============================================================
   PRINT DOCUMENT
============================================================ */

function buildMeritPrintDocument({
  rows,
  classLabel,
  section,
  examName,
  academicYear,
  schoolName,
  schoolAddress,
  logoUrl,
}: {
  rows: MeritListRow[];

  classLabel: string;

  section: string;

  examName: string;

  academicYear: string;

  schoolName: string;

  schoolAddress: string;

  logoUrl: string;
}): string {

  const titleExam =
    examName ||
    `বার্ষিক পরীক্ষা - ${academicYear}`;

  return `
<!DOCTYPE html>

<html lang="bn">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ${escapeHtml(
      classLabel,
    )}
    - Merit List
  </title>


  <style>

    /* ======================================================
       PAGE
    ====================================================== */

    @page {

      size: A4 portrait;

      margin:
        12mm
        12mm
        14mm
        12mm;
    }


    @media print {

      html,
      body {

        width:
          100%;

        margin:
          0;

        padding:
          0;
      }


      .print-toolbar {

        display:
          none !important;
      }


      .document {

        width:
          100%;
      }


      .merit-table {

        page-break-inside:
          auto;
      }


      .merit-table tr {

        page-break-inside:
          avoid;

        break-inside:
          avoid;
      }


      .merit-table thead {

        display:
          table-header-group;
      }


      .school-header,
      .class-line,
      .footer {

        break-inside:
          avoid;
      }
    }


    /* ======================================================
       BASE
    ====================================================== */

    * {

      box-sizing:
        border-box;
    }


    html,
    body {

      margin:
        0;

      padding:
        0;

      background:
        #ffffff;

      color:
        #111111;
    }


    body {

      font-family:

        "Noto Sans Bengali",

        "SolaimanLipi",

        "Kalpurush",

        "Noto Sans",

        Arial,

        sans-serif;

      -webkit-print-color-adjust:
        exact;

      print-color-adjust:
        exact;
    }


    /* ======================================================
       SCREEN TOOLBAR
    ====================================================== */

    .print-toolbar {

      position:
        sticky;

      top:
        0;

      z-index:
        9999;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      padding:
        10px
        14px;

      background:
        #74a597;

      color:
        #ffffff;

      font-family:
        Arial,
        sans-serif;

      box-shadow:
        0
        2px
        12px
        rgba(
          0,
          0,
          0,
          0.18
        );
    }


    .print-title {

      font-size:
        13px;

      font-weight:
        700;
    }


    .print-button {

      border:
        0;

      border-radius:
        7px;

      padding:
        8px
        15px;

      background:
        #c9a227;

      color:
        #ffffff;

      font-size:
        12px;

      font-weight:
        700;

      cursor:
        pointer;
    }


    /* ======================================================
       DOCUMENT
    ====================================================== */

    .document {

      width:
        100%;

      background:
        #ffffff;
    }


    .page {

      width:
        100%;

      background:
        #ffffff;

      padding:
        0;
    }


    /* ======================================================
       HEADER
    ====================================================== */

    .school-header {

      display:
        grid;

      grid-template-columns:
        31mm
        1fr
        31mm;

      align-items:
        start;

      min-height:
        34mm;

      margin-bottom:
        1mm;
    }


    .logo-wrapper {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      padding-top:
        1mm;
    }


    .logo {

      width:
        25mm;

      height:
        25mm;

      object-fit:
        contain;
    }


    .header-center {

      text-align:
        center;

      padding-top:
        0;
    }


    .school-name {

      color:
        #111111;

      font-size:
        20px;

      line-height:
        1.1;

      font-weight:
        800;

      margin:
        0
        0
        1.5mm
        0;
    }


    .school-address {

      color:
        #111111;

      font-size:
        8.5px;

      line-height:
        1.15;

      margin-bottom:
        1.2mm;
    }


    .exam-name {

      color:
        #111111;

      font-size:
        10.5px;

      line-height:
        1.1;

      font-weight:
        700;

      margin-bottom:
        1.8mm;
    }


    /* ======================================================
       RESULT TITLE
    ====================================================== */

    .result-title {

      display:
        inline-block;

      border:
        2px
        solid
        #111111;

      padding:
        1.2mm
        8mm;

      font-size:
        17px;

      line-height:
        1;

      font-weight:
        900;

      color:
        #111111;
    }


    /* ======================================================
       CLASS LINE
    ====================================================== */

    .class-line {

      margin-top:
        2mm;

      margin-bottom:
        3mm;

      text-align:
        left;

      font-size:
        10.5px;

      line-height:
        1.2;

      font-weight:
        700;
    }


    .class-line .class-value {

      font-weight:
        800;
    }


    /* ======================================================
       MERIT TABLE
    ====================================================== */

    .merit-table {

      width:
        100%;

      border-collapse:
        collapse;

      table-layout:
        fixed;

      border:
        1.2px
        solid
        #555555;

      font-size:
        9px;

      margin:
        0;
    }


    /* ======================================================
       COLUMN WIDTHS
       
       Matched to the supplied reference:
       
       Serial       = narrow
       Name         = widest
       Total        = medium
       Grade        = medium
       Position     = medium
    ====================================================== */

    .serial-column {

      width:
        14mm;
    }


    .student-column {

      width:
        auto;
    }


    .total-column {

      width:
        27mm;
    }


    .grade-column {

      width:
        27mm;
    }


    .position-column {

      width:
        27mm;
    }


    /* ======================================================
       HEADER CELLS
    ====================================================== */

    .merit-table thead th {

      border:
        1px
        solid
        #1b1a1a;

      background:
        #063d23;

      color:
        #ffffff;

      text-align:
        center;

      vertical-align:
        middle;

      padding:
        2mm
        1.5mm;

      font-size:
        10px;

      font-weight:
        800;

      line-height:
        1.1;
    }


    /* ======================================================
       BODY CELLS
    ====================================================== */
    .marit-table tbody tr:nth-child(even) td {

      background:
        #f1f8f4;
    }

    .merit-table tbody tr:nth-child(odd) td {

      background:
        #ffffff;
    }
    .merit-table tbody td {

      border:
        1px
        solid
        #131212;

      background:
        #ffffff;

      color:
        #111111;

      vertical-align:
        middle;

      padding:
        1.5mm
        1.5mm;

      line-height:
        1.15;
    }


    /* ======================================================
       SERIAL
    ====================================================== */

    .serial-cell {

      text-align:
        center;

      font-size:
       11px;

      font-weight:
        650;
    }


    /* ======================================================
       STUDENT NAME
    ====================================================== */

    .student-cell {

      text-align:
        left;

      padding-left:
        2.5mm !important;

      padding-right:
        2mm !important;
    }


    .student-name {

      font-size:
        10px;

      font-weight:
        700;

      line-height:
        1.1;
    }


    .student-id {

      margin-top:
        0.4mm;

      font-family:
        Arial,
        sans-serif;

      font-size:
        7px;

      color:
        #2b333d;

      line-height:
        1;
    }


    /* ======================================================
       NUMBER / TOTAL
    ====================================================== */

    .total-cell {

      text-align:
        center;

      font-family:
        Arial,
        "Noto Sans Bengali",
        sans-serif;

      font-size:
        12px;

      font-weight:
        700;
    }


    /* ======================================================
       GRADE
    ====================================================== */

    .grade-cell {

      text-align:
        center;

      font-family:
        Arial,
        sans-serif;

      font-size:
        12px;

      font-weight:
        750;
    }


    /* ======================================================
       POSITION
    ====================================================== */

    .position-cell {

      text-align:
        center;

      font-family:
        Arial,
        "Noto Sans Bengali",
        sans-serif;

      font-size:
        12px;

      font-weight:
        700;
    }


    /* ======================================================
       SPECIAL X ROW
       
       In the PDF:
       missing / incomplete = X
    ====================================================== */

    .merit-table tbody tr:has(
      .grade-cell
    ) {

      page-break-inside:
        avoid;
    }


    /* ======================================================
       FOOTER
    ====================================================== */

    .footer {

      display:
        grid;

      grid-template-columns:
        1fr
        1fr
        1fr;

      align-items:
        end;

      min-height:
        6mm;

      margin-top:
        8mm;
    }


    .footer-left {

      font-size:
        8px;

      text-align:
        left;
    }


    .footer-center {

      text-align:
        center;
    }


    .footer-right {

      text-align:
        center;

      font-size:
        9px;

      line-height:
        1.3;
    }


    .signature-line {

      width:
        35mm;

      margin:
        0
        auto;

      padding-top:
        1.5mm;

      border-top:
        1px
        solid
        #111111;

      font-size:
        8px;

      font-weight:
        700;

      line-height:
        1.25;
    }


    /* ======================================================
       SCREEN PREVIEW
    ====================================================== */

    @media screen {

      body {

        background:
          #e8ecea;
      }


      .document {

        max-width:
          210mm;

        margin:
          20px
          auto;

        padding:
          10mm;

        background:
          #ffffff;

        box-shadow:
          0
          5px
          30px
          rgba(
            0,
            0,
            0,
            0.15
          );
      }

    }

  </style>

</head>


<body>


  <!-- ======================================================
       PRINT TOOLBAR
  ====================================================== -->

  <div class="print-toolbar no-print">

    <div class="print-title">

      আল ইমান ইসলামিক একাডেমি
      — মেধা তালিকা

    </div>


    <button
      class="print-button"
      type="button"
      onclick="window.print()"
    >

      Print / Save as PDF

    </button>

  </div>


  <!-- ======================================================
       DOCUMENT
  ====================================================== -->

  <main class="document">

    <section class="page">


      <!-- ==================================================
           SCHOOL HEADER
      =================================================== -->

      <header class="school-header">


        <!-- Logo -->

        <div class="logo-wrapper">

          <img
            class="logo"
            src="${escapeHtml(
              logoUrl,
            )}"
            alt="School Logo"
          />

        </div>


        <!-- Center -->

        <div class="header-center">

          <div class="school-name">

            ${escapeHtml(
              schoolName,
            )}

          </div>


          <div class="school-address">

            ${escapeHtml(
              schoolAddress,
            )}

          </div>


          <div class="exam-name">

            ${escapeHtml(
              titleExam,
            )}

          </div>


          <div class="result-title">

            ফলাফল পত্র

          </div>

        </div>


        <!-- Empty right side
             intentionally kept to center
             the school header -->

        <div></div>

      </header>


      <!-- ==================================================
           CLASS
      =================================================== -->

      <div class="class-line">

        শ্রেণি :

        <span class="class-value">

          ${escapeHtml(
            classLabel,
          )}

        </span>


   

      </div>


      <!-- ==================================================
           MERIT TABLE
      =================================================== -->

      ${buildMeritTable(
        rows,
      )}


      <!-- ==================================================
           FOOTER
      =================================================== -->

      <footer class="footer">


        <div class="footer-left">
        </div>


        <div class="footer-center">
        </div>


        <div class="footer-right">

          <div class="signature-line">

            স্বাক্ষর

            <br />

            প্রতিষ্ঠাতা পরিচালক

          </div>

        </div>


      </footer>


    </section>

  </main>


</body>

</html>
  `;
}

/* ============================================================
   MAIN FUNCTION
============================================================ */

export async function generateMeritListPdf({
  resultRows,
  className,
  classLabel,
  section = "",
  examName,
  academicYear,
  schoolName =
    "আল ইমান ইসলামিক একাডেমি",
  schoolAddress =
    "কামাল পাড়া, যুব সংঘ ভবন (৩য় তলা), হাটহাজারী পৌরসভা, চট্টগ্রাম",
  logoUrl = logo,
}: GenerateMeritListPdfOptions): Promise<void> {

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!resultRows.length) {

    throw new Error(
      "No result rows available.",
    );

  }


  /* ==========================================================
     SORT BY EXISTING MERIT POSITION
  ========================================================== */

  const sortedRows =
    sortMeritRows(
      resultRows,
    );


  /* ==========================================================
     BUILD HTML
  ========================================================== */

  const html =
    buildMeritPrintDocument({
      rows:
        sortedRows,

      classLabel,

      section,

      examName,

      academicYear,

      schoolName,

      schoolAddress,

      logoUrl,
    });


  /* ==========================================================
     HIDDEN IFRAME
     
     No popup.
     No html2canvas.
     No jsPDF.
  ========================================================== */

  const iframe =
    document.createElement(
      "iframe",
    );


  iframe.setAttribute(
    "title",
    "Merit List Print",
  );


  iframe.style.position =
    "fixed";

  iframe.style.left =
    "-10000px";

  iframe.style.top =
    "0";

  iframe.style.width =
    "1px";

  iframe.style.height =
    "1px";

  iframe.style.border =
    "0";

  iframe.style.opacity =
    "0";

  iframe.style.pointerEvents =
    "none";


  document.body.appendChild(
    iframe,
  );


  /* ==========================================================
     WRITE HTML
  ========================================================== */

  const iframeDocument =
    iframe.contentDocument ||
    iframe.contentWindow?.document;


  if (!iframeDocument) {

    iframe.remove();

    throw new Error(
      "Unable to create merit list print document.",
    );
  }


  iframeDocument.open();

  iframeDocument.write(
    html,
  );

  iframeDocument.close();


  /* ==========================================================
     WAIT FOR LOAD
  ========================================================== */

  await new Promise<void>(
    (resolve) => {

      let resolved =
        false;


      const finish = () => {

        if (resolved) {
          return;
        }

        resolved =
          true;

        resolve();

      };


      if (
        iframeDocument.readyState ===
        "complete"
      ) {

        setTimeout(
          finish,
          400,
        );

        return;
      }


      iframe.addEventListener(
        "load",
        () => {

          setTimeout(
            finish,
            400,
          );

        },
        {
          once: true,
        },
      );


      setTimeout(
        finish,
        1200,
      );

    },
  );


  /* ==========================================================
     WAIT FOR LOGO
  ========================================================== */

  try {

    const images =
      Array.from(
        iframeDocument.images,
      );


    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>(
            (resolve) => {

              if (
                image.complete
              ) {

                resolve();

                return;
              }


              image.onload =
                () => resolve();

              image.onerror =
                () => resolve();

            },
          ),
      ),
    );

  } catch {
    // Continue even if logo loading fails.
  }


  /* ==========================================================
     WAIT FOR FONTS
  ========================================================== */

  try {

    if (
      iframeDocument.fonts
    ) {

      await iframeDocument.fonts.ready;

    }

  } catch {
    // Continue.
  }


  /* ==========================================================
     PRINT
  ========================================================== */

  const printWindow =
    iframe.contentWindow;


  if (!printWindow) {

    iframe.remove();

    throw new Error(
      "Unable to access merit list print window.",
    );
  }


  printWindow.focus();


  await new Promise<void>(
    (resolve) => {

      setTimeout(
        resolve,
        250,
      );

    },
  );


  printWindow.print();


  /* ==========================================================
     CLEANUP
  ========================================================== */

  let cleaned =
    false;


  const cleanup = () => {

    if (cleaned) {
      return;
    }

    cleaned =
      true;


    setTimeout(
      () => {

        iframe.remove();

      },
      1000,
    );

  };


  printWindow.addEventListener(
    "afterprint",
    cleanup,
    {
      once: true,
    },
  );


  /*
   * Fallback in case afterprint isn't fired.
   */

  setTimeout(
    cleanup,
    30000,
  );
}