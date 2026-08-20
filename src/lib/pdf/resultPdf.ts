// src/lib/pdf/resultPdf.ts

import logo from "@/assets/logo.png";

import {
  safePdfFileName,
  toBanglaDigits,
} from "./pdfUtils";

/* ============================================================
   TYPES
============================================================ */

export type ResultPdfRow = {
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

export type GenerateFullResultPdfOptions = {
  resultRows: ResultPdfRow[];

  subjects: string[];

  className: string;

  classLabel: string;

  section?: string;

  examName: string;

  academicYear: string;

  schoolName?: string;

  schoolAddress?: string;

  logoUrl?: string;

  /*
   * Number of student rows per printed page.
   *
   * Only the FIRST page renders the header
   * (logo / school info / grade scale / summary).
   *
   * The footer is rendered only once, attached
   * to the LAST page.
   */
  rowsPerPage?: number;
};

/* ============================================================
   GRADE SCALE
============================================================ */

const GRADE_SCALE = [
  {
    range: "80-100",
    grade: "A+",
    point: "5.00",
  },
  {
    range: "70-79",
    grade: "A",
    point: "4.00",
  },
  {
    range: "60-69",
    grade: "A-",
    point: "3.50",
  },
  {
    range: "50-59",
    grade: "B",
    point: "3.00",
  },
  {
    range: "40-49",
    grade: "C",
    point: "2.00",
  },
  {
    range: "33-39",
    grade: "D",
    point: "1.00",
  },
  {
    range: "00-32",
    grade: "F",
    point: "0.00",
  },
];

const DEFAULT_ROWS_PER_PAGE = 15;

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
   CHUNK HELPER
============================================================ */

function chunkRows(
  resultRows: ResultPdfRow[],
  rowsPerPage: number,
): ResultPdfRow[][] {
  if (rowsPerPage <= 0) {
    return [resultRows];
  }

  const pages: ResultPdfRow[][] = [];

  for (
    let i = 0;
    i < resultRows.length;
    i += rowsPerPage
  ) {
    pages.push(
      resultRows.slice(
        i,
        i + rowsPerPage,
      ),
    );
  }

  return pages.length
    ? pages
    : [resultRows];
}

/* ============================================================
   PDF MARK
============================================================ */

/*
 * IMPORTANT:
 *
 * ADMIN TABLE:
 *     absent -> A
 *
 * OFFICIAL PDF:
 *     absent -> X
 *     missing -> X
 *
 * We intentionally never print "A" for absence here.
 */

function formatPdfMark(
  value: number | null | undefined,
  isAbsent: boolean,
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
   PDF GPA
============================================================ */

function formatPdfGpa(
  value: number | null,
): string {
  if (value === null) {
    return "X";
  }

  return value.toFixed(2);
}

/* ============================================================
   PDF GRADE
============================================================ */

function formatPdfGrade(
  value: string | null | undefined,
): string {
  if (!value) {
    return "X";
  }

  return value;
}

/* ============================================================
   GRADE SCALE
============================================================ */

function buildGradeScale(): string {
  return `
    <div class="grade-scale">

      <div class="grade-scale-title">
        গ্রেড পদ্ধতি
      </div>

      <table>
        <thead>
          <tr>
            <th>নম্বর</th>
            <th>গ্রেড</th>
            <th>গ্রেড পয়েন্ট</th>
          </tr>
        </thead>

        <tbody>

          ${GRADE_SCALE.map(
            (item) => `
              <tr>
                <td>${item.range}</td>
                <td>${item.grade}</td>
                <td>${item.point}</td>
              </tr>
            `,
          ).join("")}

        </tbody>
      </table>

    </div>
  `;
}

/* ============================================================
   TABLE HEADER
============================================================ */

function buildTableHeader(
  subjects: string[],
): string {
  return `
    <thead>

      <tr>

        <th class="serial-col">
          ক্র. নং
        </th>

        <th class="name-col">
          পরীক্ষার্থীর নাম
        </th>

        ${subjects
          .map(
            (subject) => `
              <th class="subject-col">
                ${escapeHtml(subject)}
              </th>
            `,
          )
          .join("")}

        <th class="total-col">
          সর্বমোট
        </th>

        <th class="grade-col">
          গ্রেড
        </th>

        <th class="gpa-col">
          গ্রেড<br />
          পয়েন্ট
        </th>

        <th class="position-col">
          অবস্থান
        </th>

      </tr>

    </thead>
  `;
}

/* ============================================================
   TABLE ROW
============================================================ */

function buildTableRow(
  row: ResultPdfRow,
  subjects: string[],
  serial: number,
): string {
  return `
    <tr>

      <td class="serial-col">
        ${toBanglaDigits(serial)}
      </td>

      <td class="name-col student-name">

        <div class="student-name-main">
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

      ${subjects
        .map((subject) => {
          const value =
            row.marks[subject] ??
            null;

          const absent =
            row.absent?.[subject] ??
            false;

          return `
            <td class="subject-col">
              ${formatPdfMark(
                value,
                absent,
              )}
            </td>
          `;
        })
        .join("")}

      <td class="total-col strong">
        ${
          row.total === null
            ? "X"
            : toBanglaDigits(
                row.total,
              )
        }
      </td>

      <td class="grade-col strong">
        ${formatPdfGrade(
          row.grade,
        )}
      </td>

      <td class="gpa-col">
        ${formatPdfGpa(
          row.gpa,
        )}
      </td>

      <td class="position-col strong">
        ${
          row.position === null
            ? "X"
            : toBanglaDigits(
                row.position,
              )
        }
      </td>

    </tr>
  `;
}

/* ============================================================
   TABLE FOR A SINGLE PAGE
============================================================ */

function buildResultTable(
  pageRows: ResultPdfRow[],
  subjects: string[],
  startSerial: number,
): string {
  return `
    <table class="result-table">

      <colgroup>

        <col class="serial-width" />

        <col class="name-width" />

        ${subjects
          .map(
            () =>
              `<col class="subject-width" />`,
          )
          .join("")}

        <col class="total-width" />
        <col class="grade-width" />
        <col class="gpa-width" />
        <col class="position-width" />

      </colgroup>

      ${buildTableHeader(
        subjects,
      )}

      <tbody>

        ${pageRows
          .map(
            (row, index) =>
              buildTableRow(
                row,
                subjects,
                startSerial +
                  index,
              ),
          )
          .join("")}

      </tbody>

    </table>
  `;
}

/* ============================================================
   COMPLETE HTML DOCUMENT
============================================================ */

function buildPrintDocument({
  resultRows,
  subjects,
  classLabel,
  section,
  examName,
  academicYear,
  schoolName,
  schoolAddress,
  logoUrl,
  rowsPerPage,
}: {
  resultRows: ResultPdfRow[];

  subjects: string[];

  classLabel: string;

  section: string;

  examName: string;

  academicYear: string;

  schoolName: string;

  schoolAddress: string;

  logoUrl: string;

  rowsPerPage: number;
}): string {
  const completeRows =
    resultRows.filter(
      (row) =>
        row.complete &&
        row.total !== null,
    );

  const passedRows =
    completeRows.filter(
      (row) =>
        row.grade !== "F" &&
        row.gpa !== null &&
        row.gpa > 0,
    );

  const totals =
    completeRows
      .map(
        (row) => row.total,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

  const highestTotal =
    totals.length > 0
      ? Math.max(...totals)
      : null;

  const lowestTotal =
    totals.length > 0
      ? Math.min(...totals)
      : null;

  const passRate =
    resultRows.length > 0
      ? (passedRows.length /
          resultRows.length) *
        100
      : 0;

  const pageTitle =
    `${classLabel} - ${examName} - Full Result`;

  const classInfoText = [
    classLabel,
    section,
  ]
    .filter(Boolean)
    .join(" — ");

  /* ==========================================================
     BUILD HEADER (PAGE 1 ONLY)
  ========================================================== */

  const headerHtml = `
    <header class="header">

      <div class="logo-box">

        <img
          class="logo"
          src="${escapeHtml(logoUrl)}"
          alt="School Logo"
        />

      </div>


      <div class="school-header">

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
            examName ||
              `বার্ষিক পরীক্ষা - ${academicYear}`,
          )}

        </div>

        <div class="result-title">
          ফলাফল পত্র
        </div>

        ${
          classInfoText
            ? `
              <div class="class-info-header">
                শ্রেণি : ${escapeHtml(
                  classInfoText,
                )}
              </div>
            `
            : ""
        }

      </div>


      ${buildGradeScale()}

    </header>


    <section class="summary-area">

      <div class="summary-boxes">

        <div class="summary-item">

          <span>
            মোট পরীক্ষার্থীর সংখ্যা
          </span>

          <span class="summary-value">
            ${toBanglaDigits(
              resultRows.length,
            )}
          </span>

        </div>


        <div class="summary-item">

          <span>
            শতকরা পাশের হার
          </span>

          <span class="summary-value">
            ${toBanglaDigits(
              passRate.toFixed(
                0,
              ),
            )}%
          </span>

        </div>

      </div>

    </section>
  `;

  /* ==========================================================
     BUILD FOOTER (LAST PAGE ONLY)
  ========================================================== */

  const footerHtml = `
    <footer class="footer-area">

      <div class="footer-left">

        ${
          highestTotal !== null
            ? `
              সর্বোচ্চ মোট :
              <strong>
                ${toBanglaDigits(
                  highestTotal,
                )}
              </strong>
              <br />
            `
            : ""
        }

        ${
          lowestTotal !== null
            ? `
              সর্বনিম্ন মোট :
              <strong>
                ${toBanglaDigits(
                  lowestTotal,
                )}
              </strong>
            `
            : ""
        }

        <br />

        মোট পরীক্ষার্থী :
        <strong>
          ${toBanglaDigits(
            resultRows.length,
          )}
        </strong>

      </div>


      <div class="footer-center">

        <div class="signature">
          স্বাক্ষর
          <br />
          প্রতিষ্ঠাতা পরিচালক
        </div>

      </div>


      <div class="footer-right">

        ${escapeHtml(
          academicYear,
        )}

        <br />

        ${escapeHtml(
          classLabel,
        )}

      </div>

    </footer>
  `;

  /* ==========================================================
     BUILD EACH PAGE
     - Page 1 only: header + summary
     - Every page: its own table chunk (with its own thead)
     - Last page only: footer
  ========================================================== */

  const pages =
    chunkRows(
      resultRows,
      rowsPerPage,
    );

  let runningSerial = 1;

  const pagesHtml = pages
    .map((pageRows, pageIndex) => {
      const isFirstPage =
        pageIndex === 0;

      const isLastPage =
        pageIndex ===
        pages.length - 1;

      const tableHtml =
        buildResultTable(
          pageRows,
          subjects,
          runningSerial,
        );

      runningSerial +=
        pageRows.length;

      return `
        <section class="print-page${
          isLastPage
            ? " print-page-last"
            : ""
        }">

          ${
            isFirstPage
              ? headerHtml
              : ""
          }

          ${tableHtml}

          ${
            isLastPage
              ? footerHtml
              : ""
          }

        </section>
      `;
    })
    .join("");

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
    ${escapeHtml(pageTitle)}
  </title>

  <style>

    /* ======================================================
       PAGE
    ====================================================== */

    @page {
      size: A4 landscape;
      margin: 3mm;
    }

    @media print {

      html,
      body {
        width: 100%;
        margin: 0;
        padding: 0;
      }

      .no-print {
        display: none !important;
      }

      .result-document {
        width: 100%;
      }

      .result-table {
        page-break-inside: auto;
      }

      .result-table tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .result-table thead {
        display: table-header-group;
      }

      .result-table tfoot {
        display: table-footer-group;
      }

      .header {
        break-inside: avoid;
      }

      .summary-area {
        break-inside: avoid;
      }

      .footer-area {
        break-inside: avoid;
      }

      /*
       * Each .print-page is one physical page.
       * Force a page break AFTER every page
       * except the last one.
       */

      .print-page {
        break-after: page;
        page-break-after: always;
      }

      .print-page-last {
        break-after: auto;
        page-break-after: auto;
      }
    }

    /* ======================================================
       BASE
    ====================================================== */

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111111;
    }

    body {

      font-family:
        "Noto Sans Bengali",
        "SolaimanLipi",
        "Kalpurush",
        "Noto Sans",
        Arial,
        sans-serif;

      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .result-document {
      width: 100%;
      background: #ffffff;
      padding: 0;
    }

    /* ======================================================
       PRINT TOOLBAR
    ====================================================== */

    .print-toolbar {

      position: sticky;

      top: 0;

      z-index: 9999;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 12px;

      padding:
        12px
        16px;

      background:
        #004d3a;

      color: #ffffff;

      font-family:
        Arial,
        sans-serif;

      box-shadow:
        0
        2px
        10px
        rgba(
          0,
          0,
          0,
          0.18
        );
    }

    .print-toolbar-title {
      font-size: 14px;
      font-weight: 700;
    }

    .print-toolbar button {

      border: 0;

      border-radius: 8px;

      padding:
        9px
        16px;

      background:
        #c9a227;

      color:
        #ffffff;

      font-size: 13px;

      font-weight: 700;

      cursor: pointer;
    }

    .print-toolbar button:hover {
      background: #b28d1d;
    }

    /* ======================================================
       PRINT PAGE WRAPPER
    ====================================================== */

    .print-page {

      width: 100%;

      background: #ffffff;

      padding:
        3mm
        2mm
        5mm
        2mm;
    }

    /* ======================================================
       HEADER
    ====================================================== */

    .header {

      display: grid;

      grid-template-columns:
        25mm
        1fr
        52mm;

      align-items: center;

      column-gap: 4mm;

      min-height: 34mm;

      margin-bottom: 2mm;
    }

    .logo-box {

      display: flex;

      align-items: center;

      justify-content: center;
    }

    .logo {

      width: 23mm;

      height: 23mm;

      object-fit: contain;
    }

    .school-header {

      text-align: center;

      line-height: 1.15;
    }

    .school-name {

      color:
        #004d3a;

      font-size:
        22px;

      font-weight:
        800;

      letter-spacing:
        0.2px;

      margin-bottom:
        1mm;
    }

    .school-address {

      color:
        #222222;

      font-size:
        9.5px;

      margin-bottom:
        1mm;
    }

    .exam-name {

      color:
        #111111;

      font-size:
        12px;

      font-weight:
        700;

      margin-bottom:
        1.5mm;
    }

    .result-title {

      display:
        inline-block;

      border:
        2px
        solid
        #111111;

      padding:
        1mm
        12mm;

      color:
        #111111;

      font-size:
        18px;

      font-weight:
        800;

      line-height:
        1;
    }

    .class-info-header {

      margin-top:
        1.5mm;

      font-size:
        11px;

      font-weight:
        700;

      color:
        #111111;
    }

    /* ======================================================
       GRADE SCALE
    ====================================================== */

    .grade-scale {

      width: 52mm;

      border:
        1px
        solid
        #444444;

      background:
        #ffffff;

      font-family:
        "Noto Sans Bengali",
        "SolaimanLipi",
        "Kalpurush",
        Arial,
        sans-serif;
    }

    .grade-scale-title {

      padding:
        1.5mm
        1mm;

      text-align:
        center;

      background:
        #004d3a;

      color:
        #ffffff;

      font-size:
        8px;

      font-weight:
        800;
    }

    .grade-scale table {

      width: 100%;

      border-collapse:
        collapse;

      table-layout:
        fixed;

      font-size:
        7px;
    }

    .grade-scale th,
    .grade-scale td {

      border:
        1px
        solid
        #777777;

      padding:
        1mm
        0.5mm;

      text-align:
        center;

      line-height:
        1.05;
    }

    .grade-scale th {

      background:
        #eef7f2;

      color:
        #004d3a;

      font-weight:
        800;
    }

    /* ======================================================
       CLASS / SUMMARY AREA
    ====================================================== */

    .summary-area {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      margin:
        1.5mm
        0
        2mm;
    }

    .summary-boxes {

      display:
        flex;

      align-items:
        center;

      gap:
        10mm;
    }

    .summary-item {

      display:
        flex;

      align-items:
        center;

      gap:
        2.5mm;

      font-size:
        10px;

      font-weight:
        700;

      color:
        #111111;
    }

    .summary-value {

      display:
        inline-block;

      min-width:
        14mm;

      border:
        1.4px
        solid
        #333333;

      border-radius:
        5mm;

      padding:
        1mm
        4mm;

      text-align:
        center;

      background:
        #ffffff;

      color:
        #004d3a;

      font-size:
        11px;

      font-weight:
        800;
    }

    /* ======================================================
       RESULT TABLE
    ====================================================== */

    .result-table {

      width:
        100%;

      border-collapse:
        collapse;

      table-layout:
        fixed;

      font-size:
        8px;

      border:
        1.2px
        solid
        #3f3f3f;

      margin:
        0
        0
        4mm
        0;
    }

    /* Dynamic subject width */

    .serial-width {
      width: 8mm;
    }

    .name-width {
      width: 42mm;
    }

    .subject-width {
      width: auto;
    }

    .total-width {
      width: 16mm;
    }

    .grade-width {
      width: 13mm;
    }

    .gpa-width {
      width: 17mm;
    }

    .position-width {
      width: 13mm;
    }

    .result-table thead th {

      background:
        #006B4F;

      color:
        #ffffff;

      border:
        1px
        solid
        #004d3a;

      padding:
        1.7mm
        0.8mm;

      text-align:
        center;

      vertical-align:
        middle;

      font-weight:
        800;

      line-height:
        1.08;

      word-break:
        break-word;
    }

    .result-table tbody td {

      border:
        1px
        solid
        #737373;

      padding: 0.9mm 0.7mm;

      text-align:
        center;

      vertical-align:
        middle;

      line-height:
        1.05;

      color:
        #111111;
    }

    .result-table tbody tr:nth-child(even) td {

      background:
        #f1f8f4;
    }

    .result-table tbody tr:nth-child(odd) td {

      background:
        #ffffff;
    }

    .serial-col {

      text-align:
        center !important;

      font-weight:
        600;
      font-size:9px;
    }

    .name-col {

      text-align:
        left !important;

      padding-left:
        1.5mm !important;

      padding-right:
        1mm !important;
    }

    .student-name-main {

      font-weight:
        700;

      line-height:
        1.1;

      white-space:
        nowrap;

      overflow:
       visible;

      text-overflow:
        ellipsis;

      transform:
        translateY(0.3mm);  
    }

    .student-id {

      color:
        #2b333d;

      font-size:
        7px;

      margin-top:
        0.5mm;

      font-family:
        Arial,
        sans-serif;
    }

    .subject-col {

      text-align:
        center !important;
        font-weight: 600;
        font-size: 14px;
    }

    .total-col {

      text-align:center !important;
      font-weight:800;
      font-size: 14px;
    }

    .grade-col {

      text-align:
        center !important;

      font-weight:
        800;
      font-size: 14px;
    }

    .gpa-col {

      text-align:
        center !important;

      font-family:
        Arial,
        sans-serif;
      font-weight:700;
      font-size: 14px;
    }

    .position-col {

      text-align: center !important;
      font-weight: 800;
      font-size: 12px;
    }

    .strong {
      font-weight:
        800;
    }

    /* ======================================================
       FOOTER
    ====================================================== */

    .footer-area {

      display:
        grid;

      grid-template-columns:
        1fr
        1fr
        1fr;

      align-items:
        end;

      margin-top:
        6mm;

      min-height:
        8mm;
    }

    .footer-left {

      font-size:
        8px;

      line-height:
        1.5;
    }

    .footer-center {

      text-align:
        center;

      font-size:
        8px;
    }

    .signature {

      width:
        38mm;

      margin:
        0
        auto;

      border-top:
        1px
        solid
        #222222;

      padding-top:
        1.5mm;

      text-align:
        center;

      font-size:
        8px;

      font-weight:
        700;
    }

    .footer-right {

      text-align:
        right;

      font-size:
        8px;
    }

    /* ======================================================
       MOBILE / SCREEN ONLY
    ====================================================== */

    @media screen {

      body {
        background:
          #e8ecea;
      }

      .print-page {

        max-width:
          297mm;

        margin:
          20px
          auto;

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

        padding:
          8mm;
      }
    }

  </style>

</head>

<body>

  <!-- ======================================================
       SCREEN TOOLBAR
  ====================================================== -->

  <div class="print-toolbar no-print">

    <div class="print-toolbar-title">
      আল ইমান ইসলামিক একাডেমি — পূর্ণ ফলাফল
    </div>

    <button
      type="button"
      onclick="window.print()"
    >
      Print / Save as PDF
    </button>

  </div>


  <!-- ======================================================
       DOCUMENT (ONE .print-page PER PHYSICAL PAGE)
  ====================================================== -->

  <main class="result-document">

    ${pagesHtml}

  </main>


  <script>

    /*
     * Automatically focus the document after opening.
     *
     * We intentionally DO NOT automatically call print()
     * because some browsers block automatic print dialogs.
     */

    window.addEventListener(
      "load",
      function () {

        setTimeout(
          function () {

            window.focus();

          },
          150,
        );

      },
    );

  </script>

</body>

</html>
  `;
}

/* ============================================================
   MAIN FUNCTION
============================================================ */

export async function generateFullResultPdf({
  resultRows,
  subjects,
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
  rowsPerPage =
    DEFAULT_ROWS_PER_PAGE,
}: GenerateFullResultPdfOptions): Promise<void> {

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (!resultRows.length) {
    throw new Error(
      "No result rows available.",
    );
  }

  if (!subjects.length) {
    throw new Error(
      "No subjects available.",
    );
  }

  /* ==========================================================
     BUILD OFFICIAL PRINT DOCUMENT
  ========================================================== */

  const html =
    buildPrintDocument({
      resultRows,
      subjects,
      classLabel,
      section,
      examName,
      academicYear,
      schoolName,
      schoolAddress,
      logoUrl,
      rowsPerPage,
    });

  /* ==========================================================
     CREATE HIDDEN PRINT IFRAME
     
     IMPORTANT:
     We DO NOT use window.open().
     
     Therefore Chrome's popup blocker cannot stop
     the result PDF.
  ========================================================== */

  const iframe =
    document.createElement(
      "iframe",
    );

  iframe.setAttribute(
    "title",
    "Full Result Print",
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

  /*
   * DO NOT use display:none.
   *
   * Some browsers will not print an iframe
   * that is completely display:none.
   */

  document.body.appendChild(
    iframe,
  );

  /* ==========================================================
     WRITE DOCUMENT INTO IFRAME
  ========================================================== */

  const iframeDocument =
    iframe.contentDocument ||
    iframe.contentWindow?.document;

  if (!iframeDocument) {
    iframe.remove();

    throw new Error(
      "Unable to create the result print document.",
    );
  }

  iframeDocument.open();

  iframeDocument.write(
    html,
  );

  iframeDocument.close();

  /* ==========================================================
     WAIT FOR DOCUMENT / IMAGES
  ========================================================== */

  await new Promise<void>(
    (resolve) => {

      let resolved = false;

      const finish = () => {

        if (resolved) {
          return;
        }

        resolved = true;

        resolve();
      };

      /*
       * If the iframe document has already loaded.
       */

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

      /*
       * Normal load event.
       */

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

      /*
       * Safety fallback.
       */

      setTimeout(
        finish,
        1200,
      );
    },
  );

  /* ==========================================================
     WAIT FOR LOGO / OTHER IMAGES
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
    /*
     * Image failure should not prevent
     * the result from printing.
     */
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
    /*
     * Continue even if font readiness
     * cannot be detected.
     */
  }

  /* ==========================================================
     * PRINT
  ========================================================== */

  const printWindow =
    iframe.contentWindow;

  if (!printWindow) {

    iframe.remove();

    throw new Error(
      "Unable to access the result print window.",
    );
  }

  printWindow.focus();

  /*
   * Give Chrome a tiny amount of time to
   * finish layout before printing.
   */

  await new Promise<void>(
    (resolve) => {

      setTimeout(
        resolve,
        250,
      );

    },
  );

  /*
   * Native browser print.
   *
   * This produces much better text quality
   * than html2canvas.
   */

  printWindow.print();

  /* ==========================================================
     CLEANUP
  ========================================================== */

  /*
   * Don't remove the iframe immediately.
   *
   * Chrome needs the print document to remain
   * available while the print dialog is active.
   */

  const cleanup = () => {

    setTimeout(
      () => {

        iframe.remove();

      },
      1000,
    );
  };

  /*
   * afterprint is supported by Chrome/Edge.
   */

  printWindow.addEventListener(
    "afterprint",
    cleanup,
    {
      once: true,
    },
  );

  /*
   * Fallback cleanup.
   */

  setTimeout(
    cleanup,
    30000,
  );
}