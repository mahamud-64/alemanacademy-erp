import React, { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/resultTemp")({
  component: ExaminationResultsPage,
});

type FileType = "pdf" | "jpeg" | "jpg";

type ClassItem = {
  id: string;
  name: string;
  fileUrl: string;
  fileType: FileType;
  publicationAt: string;
};

function formatFileType(fileType: FileType) {
  return fileType === "pdf" ? "PDF" : "JPEG";
}

function getFileExtension(fileType: FileType) {
  if (fileType === "pdf") return "pdf";
  if (fileType === "jpg") return "jpg";
  return "jpeg";
}

function ExaminationResultsPage() {
  // =========================================================
  // RESULT DATA
  // =========================================================

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loadingResults, setLoadingResults] = useState(true);
  const [resultError, setResultError] = useState("");

  const selectedClass = classes.find(
    (item) => item.id === selectedClassId,
  );

  // =========================================================
  // SERVER CLOCK
  // =========================================================

  const [clockOffset, setClockOffset] = useState<number | null>(null);

  // =========================================================
  // COUNTDOWN
  // =========================================================

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isPublished, setIsPublished] = useState(false);

  // =========================================================
  // PDF / IMAGE VIEWER
  // =========================================================

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // =========================================================
  // LOAD RESULTS FROM SUPABASE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      setLoadingResults(true);
      setResultError("");

      const { data, error } = await supabase
        .from("result_temp_files")
        .select(
          `
            id,
            academic_year,
            exam_name,
            class_name,
            file_url,
            file_type,
            publication_at,
            is_published,
            is_active
          `,
        )
        .eq("is_active", true)
        .eq("is_published", true)
        .order("publication_at", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error("Public result loading error:", error);

        setResultError("Unable to load results.");
        setClasses([]);
        setLoadingResults(false);

        return;
      }

      const mapped: ClassItem[] = (data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.class_name),
        fileUrl: String(row.file_url),
        fileType: row.file_type as FileType,
        publicationAt: String(row.publication_at),
      }));

      setClasses(mapped);

      // Automatically select the first result.
      if (mapped.length > 0) {
        setSelectedClassId((current) => {
          if (
            current &&
            mapped.some((item) => item.id === current)
          ) {
            return current;
          }

          return mapped[0]!.id;
        });
      } else {
        setSelectedClassId("");
      }

      setLoadingResults(false);
    };

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // TRUSTED CLOCK
  //
  // Date.now() uses the user's device clock.
  // We compare it against the HTTP Date header from our own
  // website so changing the device clock normally won't
  // change the countdown.
  //
  // This protects the countdown display only.
  // It does NOT protect a public Storage URL from direct access.
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const syncServerTime = async () => {
      try {
        const requestStart = Date.now();

        const response = await fetch(window.location.href, {
          method: "HEAD",
          cache: "no-store",
        });

        const serverDateHeader = response.headers.get("Date");

        if (!serverDateHeader) {
          throw new Error("No Date header");
        }

        const roundTripTime = Date.now() - requestStart;

        const serverTimeAtResponse =
          new Date(serverDateHeader).getTime() +
          roundTripTime / 2;

        if (!cancelled) {
          setClockOffset(serverTimeAtResponse - Date.now());
        }
      } catch (error) {
        console.warn("Unable to synchronize server time:", error);

        // Fallback to device clock.
        if (!cancelled) {
          setClockOffset(0);
        }
      }
    };

    void syncServerTime();

    const resyncInterval = setInterval(
      syncServerTime,
      5 * 60 * 1000,
    );

    return () => {
      cancelled = true;
      clearInterval(resyncInterval);
    };
  }, []);

  // =========================================================
  // COUNTDOWN FOR SELECTED CLASS
  // =========================================================

  useEffect(() => {
    if (!selectedClass || clockOffset === null) {
      setIsPublished(false);

      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      return;
    }

    const updateTimer = () => {
      const trustedNow = Date.now() + clockOffset;

      const publicationTime = new Date(
        selectedClass.publicationAt,
      ).getTime();

      const difference = publicationTime - trustedNow;

      if (difference <= 0) {
        setIsPublished(true);

        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setIsPublished(false);

      setTimeLeft({
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24),
        ),

        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24,
        ),

        minutes: Math.floor(
          (difference / (1000 * 60)) % 60,
        ),

        seconds: Math.floor(
          (difference / 1000) % 60,
        ),
      });
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [selectedClass, clockOffset]);

  // =========================================================
  // VIEWER RESET WHEN CLASS CHANGES
  // =========================================================

  useEffect(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    if (!selectedClass || !isPublished) {
      setViewerLoading(false);
      setViewerFailed(false);
      return;
    }

    setViewerLoading(true);
    setViewerFailed(false);

    // Some mobile browsers don't fire iframe/image errors
    // reliably. This gives the user a fallback.
    loadTimeoutRef.current = setTimeout(() => {
      setViewerLoading((currentlyLoading) => {
        if (currentlyLoading) {
          setViewerFailed(true);
        }

        return false;
      });
    }, 6000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [selectedClassId, selectedClass, isPublished]);

  // =========================================================
  // SELECT CLASS
  // =========================================================

  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = () => {
    if (!selectedClass || !isPublished) return;

    // -------------------------------------------------------
    // JPEG / JPG
    // -------------------------------------------------------

    if (
      selectedClass.fileType === "jpeg" ||
      selectedClass.fileType === "jpg"
    ) {
      const printWindow = window.open("", "_blank");

      if (!printWindow) return;

      const safeTitle = selectedClass.name.replace(
        /[<>]/g,
        "",
      );

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${safeTitle} Result</title>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: white;
              }

              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }

              img {
                max-width: 100%;
                width: auto;
                height: auto;
                display: block;
              }

              @media print {
                body {
                  margin: 0;
                }

                img {
                  max-width: 100%;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>

          <body>
            <img
              src="${selectedClass.fileUrl}"
              alt="${safeTitle} Result"
              onload="window.focus(); window.print();"
            />
          </body>
        </html>
      `);

      printWindow.document.close();

      return;
    }

    // -------------------------------------------------------
    // PDF
    // -------------------------------------------------------

    const iframe = iframeRef.current;

    try {
      if (!iframe?.contentWindow) {
        throw new Error("No iframe content window");
      }

      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      const printWindow = window.open(
        selectedClass.fileUrl,
        "_blank",
      );

      if (!printWindow) return;

      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  };

  // =========================================================
  // DOWNLOAD
  // =========================================================

  const handleDownload = async () => {
    if (!selectedClass || !isPublished) return;

    setIsDownloading(true);

    try {
      const response = await fetch(selectedClass.fileUrl);

      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      const extension = getFileExtension(
        selectedClass.fileType,
      );

      link.download = `${selectedClass.name} Result.${extension}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.warn(
        "Download failed, opening file directly:",
        error,
      );

      window.open(
        selectedClass.fileUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // =========================================================
  // VIEWER LOAD SUCCESS
  // =========================================================

  const handleViewerLoaded = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    setViewerLoading(false);
    setViewerFailed(false);
  };

  // =========================================================
  // VIEWER LOAD FAILURE
  // =========================================================

  const handleViewerFailed = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    setViewerLoading(false);
    setViewerFailed(true);
  };

  // =========================================================
  // FORMAT PUBLICATION DATE
  // =========================================================

  const formattedPublicationDate = selectedClass
    ? new Date(
        selectedClass.publicationAt,
      ).toLocaleString("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-800 font-sans">
      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section
        className="text-white py-12 px-4 text-center"
        style={{
          backgroundColor: "#003B22",
          forcedColorAdjust: "none",
        }}
      >
        <div className="text-xs uppercase tracking-widest text-emerald-200 mb-2">
          Home / Results
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Examination Results
        </h2>

        <p className="text-emerald-100 text-sm max-w-xl mx-auto">
          View published class merit lists or find an
          individual student result.
        </p>
      </section>

      {/* =====================================================
          LOADING RESULTS
      ====================================================== */}

      {loadingResults && (
        <section className="px-4 pt-8">
          <div className="mx-auto max-w-5xl rounded-2xl px-6 py-10 text-center bg-white border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3 text-[#003B22]">
              <div
                className="w-8 h-8 border-4 border-gray-200 border-t-[#003B22] rounded-full animate-spin"
                style={{
                  forcedColorAdjust: "none",
                }}
              />

              <p className="text-sm font-medium">
                Loading results…
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loadingResults && resultError && (
        <section className="px-4 pt-8">
          <div className="mx-auto max-w-5xl rounded-2xl px-6 py-10 text-center bg-white border border-red-200 shadow-sm">
            <div className="text-red-600 font-semibold mb-2">
              Unable to load results
            </div>

            <p className="text-sm text-gray-600">
              Please try again later.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================
          NO RESULTS
      ====================================================== */}

      {!loadingResults &&
        !resultError &&
        classes.length === 0 && (
          <section className="px-4 pt-8">
            <div className="mx-auto max-w-5xl rounded-2xl px-6 py-12 text-center bg-white border border-gray-200 shadow-sm">
              <div className="text-[#003B22] font-bold text-lg mb-2">
                No Results Available
              </div>

              <p className="text-sm text-gray-600">
                Examination results have not been published yet.
              </p>
            </div>
          </section>
        )}

      {/* =====================================================
          RESULTS AREA
      ====================================================== */}

      {!loadingResults &&
        !resultError &&
        classes.length > 0 &&
        selectedClass && (
          <>
            {/* =================================================
                COUNTDOWN
            ================================================== */}

            {!isPublished && (
              <section className="px-3 sm:px-4 pt-2 sm:pt-8">
                <div
                  className="mx-auto max-w-5xl rounded-2xl px-4 py-6 sm:px-6 sm:py-8 text-center text-white shadow-sm"
                  style={{
                    backgroundColor: "#003B22",
                    forcedColorAdjust: "none",
                  }}
                >
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Result Announcement
                  </p>

                  <h3 className="mt-2 text-lg sm:text-2xl font-bold">
                    {selectedClass.name} Result will be
                    published in
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-emerald-100">
                    {formattedPublicationDate}
                  </p>

                  <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3">
                    {(
                      [
                        ["Days", timeLeft.days],
                        ["Hours", timeLeft.hours],
                        ["Minutes", timeLeft.minutes],
                        ["Seconds", timeLeft.seconds],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl px-3 py-3 sm:py-4 shadow-inner"
                        style={{
                          backgroundColor: "#19563F",
                          forcedColorAdjust: "none",
                        }}
                      >
                        <div className="text-2xl sm:text-3xl font-bold leading-none tabular-nums">
                          {String(value).padStart(2, "0")}
                        </div>

                        <div className="mt-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                MAIN RESULTS VIEWER
            ================================================== */}

            {isPublished && (
              <main className="max-w-5xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
                  {/* ===========================================
                      HEADER
                  ============================================ */}

                  <div className="text-center mb-6">
                    <p className="text-sm font-semibold text-emerald-700 mb-1">
                      Result Published
                    </p>

                    <h3 className="text-2xl font-bold text-[#003B22]">
                      Select Your Class
                    </h3>
                  </div>

                  {/* ===========================================
                      CLASS SELECTOR
                  ============================================ */}

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {classes.map((cls) => {
                      const clsIsPublished =
                        clockOffset !== null &&
                        new Date(
                          cls.publicationAt,
                        ).getTime() <=
                          Date.now() + clockOffset;

                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() =>
                            handleSelectClass(cls.id)
                          }
                          className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                            selectedClass.id === cls.id
                              ? "text-white shadow-md border-transparent"
                              : "bg-white border-gray-300 hover:border-[#003B22]"
                          }`}
                          style={
                            selectedClass.id === cls.id
                              ? {
                                  backgroundColor:
                                    "#003B22",
                                  forcedColorAdjust:
                                    "none",
                                }
                              : {
                                  color: "#003B22",
                                  forcedColorAdjust:
                                    "none",
                                }
                          }
                        >
                          {cls.name}

                          {!clsIsPublished && (
                            <span className="ml-1.5 text-[9px] opacity-70">
                              • Soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* ===========================================
                      SELECTED CLASS FUTURE CHECK
                  ============================================ */}

                  {!isPublished && (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-8 text-center">
                      <p className="font-semibold text-[#003B22]">
                        {selectedClass.name} result is not
                        available yet.
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Please wait until the scheduled
                        publication time.
                      </p>
                    </div>
                  )}

                  {/* ===========================================
                      VIEWER
                  ============================================ */}

                  {isPublished && (
                    <>
                      <div className="relative w-full min-h-[650px] sm:min-h-[800px] border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                        {/* ---------------------------------------
                            LOADING
                        ---------------------------------------- */}

                        {viewerLoading && !viewerFailed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="flex flex-col items-center gap-3 text-[#003B22]">
                              <div
                                className="w-8 h-8 border-4 border-gray-200 border-t-[#003B22] rounded-full animate-spin"
                                style={{
                                  forcedColorAdjust:
                                    "none",
                                }}
                              />

                              <p className="text-sm font-medium">
                                Loading result…
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ---------------------------------------
                            FAILED FALLBACK
                        ---------------------------------------- */}

                        {viewerFailed ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 17v-2a4 4 0 014-4h2m0 0V7m0 4l3-3m-3 3l-3-3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                                />
                              </svg>
                            </div>

                            <p className="text-sm text-gray-600">
                              Couldn't preview the{" "}
                              {formatFileType(
                                selectedClass.fileType,
                              )}{" "}
                              inline.
                            </p>

                            <a
                              href={selectedClass.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-[#003B22] text-white text-sm font-semibold hover:bg-[#002B19] transition"
                              style={{
                                forcedColorAdjust: "none",
                              }}
                            >
                              Open {selectedClass.name} Result
                            </a>
                          </div>
                        ) : selectedClass.fileType ===
                            "jpeg" ||
                          selectedClass.fileType ===
                            "jpg" ? (
                          /* -------------------------------------
                              JPEG / JPG VIEWER
                          -------------------------------------- */

                          <div className="w-full h-full min-h-[500px] sm:min-h-[650px] overflow-auto flex items-start justify-center p-2 sm:p-4 bg-gray-100">
                            <img
                              key={selectedClass.id}
                              src={selectedClass.fileUrl}
                              alt={`${selectedClass.name} Result`}
                              className="max-w-full h-auto object-contain"
                              onLoad={handleViewerLoaded}
                              onError={handleViewerFailed}
                            />
                          </div>
                        ) : (
                          /* -------------------------------------
                              PDF VIEWER
                          -------------------------------------- */

                          <iframe
                            key={selectedClass.id}
                            ref={iframeRef}
                            id="pdf-preview-frame"
                            src={`${selectedClass.fileUrl}#toolbar=0&navpanes=0`}
                            title={`${selectedClass.name} Result`}
                            className="w-full h-[750px] sm:h-[800px] border-none"
                            onLoad={handleViewerLoaded}
                            onError={handleViewerFailed}
                          />
                        )}
                      </div>

                      {/* =========================================
                          FILE INFORMATION
                      ========================================== */}

                      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                        <span>
                          {selectedClass.name} Result •{" "}
                          {formatFileType(
                            selectedClass.fileType,
                          )}
                        </span>

                        <span>
                          Published from scheduled time
                        </span>
                      </div>

                      {/* =========================================
                          ACTION BUTTONS
                      ========================================== */}

                      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
                        {/* PRINT */}

                        <button
                          type="button"
                          onClick={handlePrint}
                          disabled={viewerFailed}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            borderColor:
                              "rgba(0,59,34,0.3)",
                            color: "#003B22",
                            forcedColorAdjust: "none",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                            />
                          </svg>

                          Print
                        </button>

                        {/* DOWNLOAD */}

                        <button
                          type="button"
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-wait"
                          style={{
                            backgroundColor: "#003B22",
                            forcedColorAdjust: "none",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>

                          {isDownloading
                            ? "Preparing…"
                            : `Download ${formatFileType(
                                selectedClass.fileType,
                              )}`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </main>
            )}
          </>
        )}
    </div>
  );
}

export default ExaminationResultsPage;