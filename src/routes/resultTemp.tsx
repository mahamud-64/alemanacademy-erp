import React, { useState } from 'react';
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
  { id: 'play', name: 'Play', pdfUrl: '/pdfs/Play.pdf' },
  { id: 'nursery', name: 'Nursery', pdfUrl: '/pdfs/Nursery.pdf' },
  { id: 'class1', name: 'Class 1', pdfUrl: '/pdfs/Class1.pdf' },
  { id: 'class2', name: 'Class 2', pdfUrl: '/pdfs/Class2.pdf' },
  { id: 'class3', name: 'Class 3', pdfUrl: '/pdfs/Class3.pdf' },
  { id: 'class4', name: 'Class 4', pdfUrl: '/pdfs/Class4.pdf' },
  { id: 'class5', name: 'Class 5', pdfUrl: '/pdfs/Class5.pdf' },
  { id: 'class6', name: 'Class 6', pdfUrl: '/pdfs/Class6.pdf' },
  { id: 'hifz', name: 'Hifz', pdfUrl: '/pdfs/hifz.pdf' },
];

export default function ExaminationResultsPage() {
  const [selectedClass, setSelectedClass] =
    useState<ClassItem>(classes[0]!);

  const handlePrint = () => {
    const iframe = document.getElementById(
      'pdf-preview-frame'
    ) as HTMLIFrameElement | null;

    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = selectedClass.pdfUrl;
    link.download = `${selectedClass.name}.pdf`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-800 font-sans">
    {/* {/* Top Navbar 
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-[#004D2C] text-lg leading-tight">Al Eman Islamic Academy</h1>
            <p className="text-xs text-gray-500">আল ঈমান ইসলামিক একাডেমী</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#home" className="hover:text-[#004D2C]">Home</a>
          <a href="#about" className="hover:text-[#004D2C]">About</a>
          <a href="#academics" className="hover:text-[#004D2C]">Academics</a>
          <a href="#notice" className="hover:text-[#004D2C]">Notice</a>
          <a href="#results" className="text-[#004D2C] font-semibold border-b-2 border-[#004D2C] pb-1">Results</a>
          <a href="#gallery" className="hover:text-[#004D2C]">Gallery</a>
          <a href="#admission" className="hover:text-[#004D2C]">Admission</a>
          <a href="#contact" className="hover:text-[#004D2C]">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-full border border-[#004D2C] text-[#004D2C] text-sm font-medium hover:bg-emerald-50 transition">
            Student Login
          </button>
          <button className="px-4 py-1.5 rounded-full bg-[#D4A338] text-white text-sm font-medium hover:bg-[#b88c2e] transition">
            Apply Now
          </button>
        </div>
      </header>
*/}
      {/* Hero Banner Section */}
      <section className="bg-[#003B22] text-white py-12 px-4 text-center">
        <div className="text-xs uppercase tracking-widest text-emerald-200 mb-2">Home / Results</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Examination Results</h2>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto">
          View published class merit lists or find an individual student result.
        </p>
      </section>

      {/* Main Interactive Results Viewer Container */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
          
          {/* Section Title & Class Switcher Bar */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#003B22] mb-4">Select Your Class</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedClass.id === cls.id
                      ? 'bg-[#003B22] text-white shadow-md'
                      : 'bg-white text-[#003B22] border border-[#003B22]/20 hover:border-[#003B22]'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded PDF Viewer Container */}
          <div className="w-full h-[650px] border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
            <iframe
              id="pdf-preview-frame"
              src={`${selectedClass.pdfUrl}#toolbar=0&navpanes=0`}
              title={`${selectedClass.name} Result`}
              className="w-full h-full border-none"
            />
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#003B22]/30 text-[#003B22] text-sm font-semibold hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2span" />
              </svg>
              Print
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#003B22] text-white text-sm font-semibold hover:bg-[#002B19] transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}