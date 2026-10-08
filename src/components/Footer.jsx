import React, { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="w-full bg-[#1b263b] text-white font-sans relative overflow-hidden pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">
          
          {/* LEFT SECTION — BRAND */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 transform group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl italic">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-white flex items-center">
                  Tutor<span className="text-pink-500">Link</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold -mt-1">
                  Nepal
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
              TutorLink Nepal connects passionate educators with students looking for personalized learning. Share your knowledge, inspire learners, and grow your tutoring journey with us.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-3 text-slate-300 text-sm hover:text-pink-400 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-pink-400 shrink-0 text-xs">✉</span>
                <a href="mailto:support@tutorlinknepal.com">support@tutorlinknepal.com</a>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-pink-400 shrink-0 text-xs">📍</span>
                <span>Nepal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {["FB", "IG", "IN", "YT", "TK"].map((label, index) => (
                <a
                  key={index}
                  href={`#${label.toLowerCase()}`}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-slate-800/80 text-white font-bold text-xs flex items-center justify-center transition-all duration-300 hover:bg-pink-500 hover:scale-110 shadow-sm"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT SECTION — 4 COLUMNS */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* COLUMN 1 — ABOUT TUTORLINK */}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-5 relative inline-block">
                About TutorLink
                <span className="absolute bottom-[-6px] left-0 w-6 h-0.5 bg-pink-500 rounded-full"></span>
              </h4>
              <ul className="flex flex-col gap-3">
                {["About Us", "Our Mission", "How TutorLink Works", "Contact Us", "Blog"].map((name, idx) => (
                  <li key={idx}>
                    <a href={`#${name.toLowerCase().replace(/ /g, "-")}`} className="text-slate-300 text-sm hover:text-pink-400 transition-colors duration-200 block py-0.5">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 2 — FOR TUTORS */}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-5 relative inline-block">
                For Tutors
                <span className="absolute bottom-[-6px] left-0 w-6 h-0.5 bg-pink-500 rounded-full"></span>
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { name: "Become a Tutor", highlight: true },
                  { name: "How It Works" },
                  { name: "Tutor Requirements" },
                  { name: "Tutor FAQs" },
                  { name: "Tutor Guidelines" },
                  { name: "Tutor Login" }
                ].map((link, idx) => (
                  <li key={idx}>
                    <a 
                      href={`#${link.name.toLowerCase().replace(/ /g, "-")}`} 
                      className={`text-sm transition-colors duration-200 block py-0.5 ${link.highlight ? "text-pink-400 font-bold hover:text-pink-300" : "text-slate-300 hover:text-pink-400"}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3 — TUTOR SUPPORT */}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-5 relative inline-block">
                Tutor Support
                <span className="absolute bottom-[-6px] left-0 w-6 h-0.5 bg-pink-500 rounded-full"></span>
              </h4>
              <ul className="flex flex-col gap-3">
                {["Help Center", "Tutor Resources", "Application Help", "Account Support", "Contact Support", "FAQs"].map((name, idx) => (
                  <li key={idx}>
                    <a href={`#${name.toLowerCase().replace(/ /g, "-")}`} className="text-slate-300 text-sm hover:text-pink-400 transition-colors duration-200 block py-0.5">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4 — LEGAL */}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-5 relative inline-block">
                Legal
                <span className="absolute bottom-[-6px] left-0 w-6 h-0.5 bg-pink-500 rounded-full"></span>
              </h4>
              <ul className="flex flex-col gap-3">
                {["Terms & Conditions", "Privacy Policy", "Tutor Code of Conduct", "Online Safety", "Community Guidelines"].map((name, idx) => (
                  <li key={idx}>
                    <a href={`#${name.toLowerCase().replace(/ /g, "-")}`} className="text-slate-300 text-sm hover:text-pink-400 transition-colors duration-200 block py-0.5">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 TutorLink Nepal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#terms-and-conditions" className="hover:text-pink-400 transition-colors">Terms & Conditions</a>
            <a href="#privacy-policy" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
          </div>
        </div>

      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 font-bold"
        >
          ↑
        </button>
      )}
    </footer>
  );
}