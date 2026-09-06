import React, { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/resultTemp')({
  component: ExaminationResultsPage,
});

type ClassItem = {
  id: string;
  name: string;
  pdfUrl: string;
};

const classes: ClassItem[] = [
  { id: 'play', name: 'Play', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Play.pdf' },
  { id: 'nursery', name: 'Nursery', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Nursery.pdf' },
  { id: 'class1', name: 'Class 1', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class1.pdf' },
  { id: 'class2', name: 'Class 2', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class2.pdf' },
  { id: 'class3', name: 'Class 3', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class3.pdf' },
  { id: 'class4', name: 'Class 4', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class4.pdf' },
  { id: 'class5', name: 'Class 5', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class5.pdf' },
  { id: 'class6', name: 'Class 6', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/Class6.pdf' },
  { id: 'hifz', name: 'Hifz', pdfUrl: '/pdfs/i/j/l/neomonoultramicroscopicsilicovalconisis/hifz.pdf' },
];

export default function ExaminationResultsPage() {
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classes[0]!);

  // =========================================================
  // TEMPORARY RESULT PUBLICATION DATE
  // Later this can be replaced with an admin-controlled date.
  // =========================================================
  const RESULT_DATE = new Date('2026-09-07T09:00:00+06:00');

  const [isPublished, setIsPublished] = useState(
    Date.now() >= RESULT_DATE.getTime()
 );
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // =========================================================
  // TRUSTED CLOCK
  // Date.now() reads the DEVICE's clock, which a user can set
  // forward/backward to fool a client-only countdown. To guard
  // against that, we fetch the `Date` response header from our
  // own origin (every HTTP response includes one for free) and
  // compute the offset between the device clock and the
  // server's clock. All countdown math below uses
  // `Date.now() + clockOffset` instead of raw `Date.now()`.
  //
  // NOTE: this only fixes the *countdown display*. It does NOT
  // stop someone from directly opening a PDF URL early — that
  // can only be enforced server-side (e.g. the PDFs shouldn't
  // be publicly reachable, or the server should 403/404 them,
  // until the real publish time).
  // =========================================================
  const [clockOffset, setClockOffset] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncServerTime = async () => {
      try {
        const requestStart = Date.now();
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const serverDateHeader = response.headers.get('Date');
        if (!serverDateHeader) throw new Error('No Date header');

        const roundTripTime = Date.now() - requestStart;
        // Assume the response arrived roughly halfway through the
        // round trip; nudges the estimate closer to "now" on the
        // server rather than "when the request left the server".
        const serverTimeAtResponse =
          new Date(serverDateHeader).getTime() + roundTripTime / 2;

        if (!cancelled) {
          setClockOffset(serverTimeAtResponse - Date.now());
        }
      } catch {
        // If we can't reach the server (offline, blocked, etc.)
        // fall back to trusting the device clock rather than
        // freezing the countdown forever.
        if (!cancelled) setClockOffset(0);
      }
    };

    syncServerTime();
    // Re-sync periodically in case the device clock drifts (or
    // gets changed) while the tab stays open.
    const resyncInterval = setInterval(syncServerTime, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(resyncInterval);
    };
  }, []);

  // =========================================================
  // COUNTDOWN TIMER
  // =========================================================
  useEffect(() => {
    // Wait until we've synced with the server at least once so
    // we never briefly show "published" based on a bad device
    // clock before the offset arrives.
    if (clockOffset === null) return;

    const updateTimer = () => {
      const trustedNow = Date.now() + clockOffset;
      const difference = RESULT_DATE.getTime() - trustedNow;

      if (difference <= 0) {
        setIsPublished(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsPublished(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [clockOffset]);

  // =========================================================
  // PDF VIEWER STATE
  // Many mobile browsers (iOS Safari in some contexts, in-app
  // webviews like Facebook/Instagram, older Android browsers)
  // cannot render a PDF inside an <iframe> at all. We track
  // load state and errors so we can show a graceful fallback
  // instead of a blank box.
  // =========================================================
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfFailed, setPdfFailed] = useState(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset viewer state whenever the selected class changes.
    setPdfLoading(true);
    setPdfFailed(false);

    // Safety net: if the iframe's onLoad never fires (some
    // mobile browsers just show a blank frame with no error
    // and no load event for unsupported PDF content), stop
    // showing the loading spinner after a few seconds and give
    // the user the fallback "Open PDF" option instead.
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      setPdfLoading((isStillLoading) => {
        if (isStillLoading) setPdfFailed(true);
        return false;
      });
    }, 6000);

    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [selectedClass]);

  // =========================================================
  // PRINT PDF
  // iframe.contentWindow.print() is unreliable in Edge and on
  // mobile browsers (it can silently no-op or print a blank
  // page). Fall back to opening the PDF in a new tab and
  // printing from there, which works far more consistently.
  // =========================================================
  const handlePrint = () => {
    const iframe = iframeRef.current;

    try {
      if (!iframe?.contentWindow) throw new Error('No iframe content window');
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      const printWindow = window.open(selectedClass.pdfUrl, '_blank');
      if (!printWindow) return; // popup blocked, nothing more we can do
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  };

  // =========================================================
  // DOWNLOAD PDF
  // Fetching as a blob and downloading via an object URL works
  // consistently across Chrome, Edge, and Firefox. Plain
  // <a download> links are unreliable on several mobile
  // browsers (they often just open/preview the PDF instead of
  // saving it), so we fall back to a direct navigation only if
  // the fetch itself fails (e.g. offline).
  // =========================================================
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(selectedClass.pdfUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${selectedClass.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open the PDF directly. On most mobile browsers
      // the user can still save it from the native PDF viewer.
      window.open(selectedClass.pdfUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-800 font-sans">
      {/* =====================================================
          HERO SECTION
          NOTE: background color is set via inline `style`
          instead of a Tailwind bg-[#hex] class. Some Edge
          builds (enterprise-managed Chromium versions, or
          Windows "Contrast themes" / forced-colors mode)
          strip out compiled arbitrary-color utility classes —
          especially ones that ride on CSS color-mix()/oklch()
          under Tailwind v4 opacity modifiers. An inline style
          renders identically everywhere and can't be dropped
          by forced-colors for elements we explicitly opt out
          of it with forced-color-adjust below.
      ====================================================== */}
      <section
        className="text-white py-12 px-4 text-center"
        style={{ backgroundColor: '#003B22', forcedColorAdjust: 'none' }}
      >
        <div className="text-xs uppercase tracking-widest text-emerald-200 mb-2">
          Home / Results
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Examination Results
        </h2>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto">
          View published class merit lists or find an individual student result.
        </p>
      </section>

      {/* =====================================================
          RESULT COUNTDOWN
      ====================================================== */}
      {!isPublished && (
        <section className="px-3 sm:px-4 pt-2 sm:pt-8">
          <div
            className="mx-auto max-w-5xl rounded-2xl px-4 py-6 sm:px-6 sm:py-8 text-center text-white shadow-sm"
            style={{ backgroundColor: '#003B22', forcedColorAdjust: 'none' }}
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Result Announcement
            </p>
            <h3 className="mt-2 text-lg sm:text-2xl font-bold">
              Result will be published in
            </h3>

            <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3">
              {(
                [
                  ['Days', timeLeft.days],
                  ['Hours', timeLeft.hours],
                  ['Minutes', timeLeft.minutes],
                  ['Seconds', timeLeft.seconds],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-3 sm:py-4 shadow-inner"
                  style={{ backgroundColor: '#19563F', forcedColorAdjust: 'none' }}
                >
                  <div className="text-2xl sm:text-3xl font-bold leading-none tabular-nums">
                    {String(value).padStart(2, '0')}
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

      {/* =====================================================
          MAIN RESULTS VIEWER — visible only after publication
      ====================================================== */}
      {isPublished && (
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-emerald-700 mb-1">
                Result Published
              </p>
              <h3 className="text-2xl font-bold text-[#003B22]">
                Select Your Class
              </h3>
            </div>

            {/* CLASS SELECTOR */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedClass.id === cls.id
                      ? 'text-white shadow-md border-transparent'
                      : 'bg-white border-gray-300 hover:border-[#003B22]'
                  }`}
                  style={
                    selectedClass.id === cls.id
                      ? { backgroundColor: '#003B22', forcedColorAdjust: 'none' }
                      : { color: '#003B22', forcedColorAdjust: 'none' }
                  }
                >
                  {cls.name}
                </button>
              ))}
            </div>

            {/* PDF VIEWER */}
            <div className="relative w-full h-[500px] sm:h-[650px] border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
              {pdfLoading && !pdfFailed && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="flex flex-col items-center gap-3 text-[#003B22]">
                    <div className="w-8 h-8 border-4 border-[#003B22]/20 border-t-[#003B22] rounded-full animate-spin" />
                    <p className="text-sm font-medium">Loading result…</p>
                  </div>
                </div>
              )}

              {pdfFailed ? (
                // Fallback for browsers/webviews that can't render
                // a PDF inside an iframe (common in mobile in-app
                // browsers and some Android WebViews).
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <p className="text-sm text-gray-600">
                    This browser can't preview the PDF inline. You can still
                    view or download it directly.
                  </p>
                  <a
                    href={selectedClass.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full bg-[#003B22] text-white text-sm font-semibold hover:bg-[#002B19] transition"
                  >
                    Open {selectedClass.name} Result
                  </a>
                </div>
              ) : (
                <iframe
                  key={selectedClass.id}
                  ref={iframeRef}
                  id="pdf-preview-frame"
                  src={`${selectedClass.pdfUrl}#toolbar=0&navpanes=0`}
                  title={`${selectedClass.name} Result`}
                  className="w-full h-full border-none"
                  onLoad={() => setPdfLoading(false)}
                  onError={() => {
                    setPdfLoading(false);
                    setPdfFailed(true);
                  }}
                />
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
              <button
                onClick={handlePrint}
                disabled={pdfFailed}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'rgba(0,59,34,0.3)', color: '#003B22', forcedColorAdjust: 'none' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                  />
                </svg>
                Print
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-wait"
                style={{ backgroundColor: '#003B22', forcedColorAdjust: 'none' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {isDownloading ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}