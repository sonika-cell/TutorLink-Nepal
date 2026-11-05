import { useState, useMemo } from "react";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    // For Students / Parents
    {
      category: "parent",
      question: "How do I find a tutor on TutorLink?",
      answer:
        "Click 'Find Tutors' from your Parent Dashboard. You can browse all registered tutors, filter by subject, location, or experience, and view their full profiles including CV and qualifications.",
    },
    {
      category: "parent",
      question: "How do I post a tuition requirement?",
      answer:
        "Click 'Post New Tuition' on your Parent Dashboard. A quick 6-step wizard asks about your child's goal, subject, class level, learning mode, and budget. Your post goes live instantly after completion.",
    },
    {
      category: "parent",
      question: "Is posting a tuition requirement free?",
      answer:
        "Yes. Posting a tuition requirement is completely free for parents. You only pay the tutor directly for their teaching services — TutorLink charges no commission from parents.",
    },
    {
      category: "parent",
      question: "How do I view tutor applications?",
      answer:
        "On your Parent Dashboard, scroll to the 'My Applications' section. You'll see all tutors who applied to your post with their profiles, application messages, and status (pending, hired, withdrawn).",
    },
    {
      category: "parent",
      question: "How do I confirm a tutor for hire?",
      answer:
        "Open your Parent Dashboard and find the tutor's application. Click '🎯 Confirm Hire'. The tutor will be notified and must complete the placement fee before scheduling begins.",
    },
    {
      category: "parent",
      question: "What happens after I confirm a hire?",
      answer:
        "The tutor pays a one-time placement fee (25% of your monthly budget). Once paid, the tutor schedules a demo class via Jitsi Meet, and you receive a 'Join Class' button on your dashboard.",
    },
    {
      category: "parent",
      question: "Can I cancel a hire after confirming?",
      answer:
        "Once the tutor has paid the placement fee, the hire is final. If you have concerns before the demo class, please contact our support team to discuss your options.",
    },
    {
      category: "parent",
      question: "How do online classes work?",
      answer:
        "Online classes use Jitsi Meet — a free, secure video platform. No installation required. When a tutor schedules a class, both you and the tutor get a 'Join Class' button that opens the same secure room.",
    },
    {
      category: "parent",
      question: "Can I see a tutor's CV before hiring?",
      answer:
        "Yes. Every tutor uploads a CV during signup. When viewing a tutor's profile from the 'Find Tutors' page, you can see their qualifications, subjects, experience, and downloadable CV (PDF).",
    },
    {
      category: "parent",
      question: "What if I don't like the tutor after the demo class?",
      answer:
        "The demo class is your chance to evaluate the fit. If it's not right, contact our support team — we'll help you find a better match. We're committed to quality tutor-student matches.",
    },

    // For Tutors
    {
      category: "tutor",
      question: "How do I sign up as a tutor?",
      answer:
        "Click 'Register', select 'Tutor' as your role. You'll complete a 3-step setup: basic info (name, phone, subjects, class levels), location, and CV upload with terms acceptance. It takes about 5 minutes.",
    },
    {
      category: "tutor",
      question: "Do I need teaching experience to join?",
      answer:
        "Not necessarily. If you have strong subject knowledge, patience, and passion for teaching, you can join. We welcome university students, subject experts, skill instructors, and experienced teachers alike.",
    },
    {
      category: "tutor",
      question: "Is it free to apply for tuition posts?",
      answer:
        "Yes. Applying to tuition posts is completely free. You only pay when you're successfully hired — a one-time placement fee equal to 25% of the parent's monthly budget.",
    },
    {
      category: "tutor",
      question: "What is the placement fee?",
      answer:
        "The placement fee is 25% of the parent's monthly budget. For example, if the budget is Rs. 10,000, the fee is Rs. 2,500. This is a one-time payment to TutorLink, not to the parent.",
    },
    {
      category: "tutor",
      question: "When do I pay the placement fee?",
      answer:
        "After a parent confirms they want to hire you. You'll see a 'Pay Now' button on your dashboard. The fee must be paid before scheduling the demo class with the parent.",
    },
    {
      category: "tutor",
      question: "Can I cancel my application?",
      answer:
        "Yes. Before the parent hires you, you can withdraw any pending application from your dashboard. Use the '❌ Cancel Application' button — it's visible on every pending application.",
    },
    {
      category: "tutor",
      question: "Can I decline a hire after being selected?",
      answer:
        "Yes. If you're hired but haven't paid the placement fee yet, you can decline the hire. The parent's post reopens for other tutors. Once the fee is paid, the hire is final.",
    },
    {
      category: "tutor",
      question: "How do I upload my CV?",
      answer:
        "During signup, you'll reach a CV upload step. Click 'Choose CV File', select a PDF file under 2MB, and accept the terms. You can also update your CV anytime from your profile settings.",
    },
    {
      category: "tutor",
      question: "How do I schedule a demo class?",
      answer:
        "After paying the placement fee, a 'Schedule Demo Class' button appears on your dashboard. Pick a date within the next 30 days, choose a time, and select online or offline mode. You can see the parent's phone number to coordinate.",
    },
    {
      category: "tutor",
      question: "Can I change my subjects or profile later?",
      answer:
        "Yes. You can update your profile anytime by clicking 'Complete My Profile' on your dashboard. Changes are reflected immediately in the tutor discovery page.",
    },
    {
      category: "tutor",
      question: "What happens if a parent doesn't show up?",
      answer:
        "Contact the parent directly using the contact info shared after your placement payment. If the issue persists, report it to our support team with details about the missed session.",
    },
  ];

  // Filter FAQ by tab + search
  const filteredFaqs = useMemo(() => {
    let result = faqs;

    // Filter by tab
    if (activeTab === "parent") {
      result = result.filter((f) => f.category === "parent");
    } else if (activeTab === "tutor") {
      result = result.filter((f) => f.category === "tutor");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Inline styles for the falling animation */}
      <style>{`
        @keyframes bookDrop {
          0% {
            transform: translateY(-300px);
            opacity: 0;
          }
          60% {
            transform: translateY(15px);
            opacity: 1;
          }
          80% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-book-drop {
          animation: bookDrop 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* Hero Section - Clean White with Falling Books on Sides */}
      <div className="bg-white border-b border-slate-100 relative overflow-hidden">
        {/* Left Book Stack with Falling Animation */}
        <div className="hidden md:flex absolute left-4 lg:left-12 bottom-0 z-0 flex-col gap-1 w-32 lg:w-44 opacity-90 pointer-events-none select-none">
          <div className="h-7 lg:h-9 bg-[#708090] rounded-r-md border-l-4 border-[#4a5568] shadow-sm flex items-center px-3 text-[10px] lg:text-xs text-white font-medium animate-book-drop" style={{ animationDelay: '0.1s' }}>Global Tutoring</div>
          <div className="h-8 lg:h-10 bg-[#a0aab2] rounded-r-md border-l-4 border-[#718096] shadow-sm flex items-center px-3 text-[10px] lg:text-xs text-slate-800 font-medium translate-x-2 animate-book-drop" style={{ animationDelay: '0.2s' }}>Learning Guides</div>
          <div className="h-7 lg:h-9 bg-[#5c6b73] rounded-r-md border-l-4 border-[#2d3748] shadow-sm flex items-center px-3 text-[10px] lg:text-xs text-white font-medium -translate-x-1 animate-book-drop" style={{ animationDelay: '0.3s' }}>Learning Guides</div>
          <div className="h-9 lg:h-11 bg-[#6b8e23] rounded-r-md border-l-4 border-[#4d6618] shadow-sm flex items-center px-3 text-[10px] lg:text-xs text-white font-medium translate-x-1 animate-book-drop" style={{ animationDelay: '0.4s' }}>Learning Guides</div>
          <div className="h-8 lg:h-10 bg-[#3a506b] rounded-r-md border-l-4 border-[#1c2541] shadow-sm flex items-center px-3 text-[10px] lg:text-xs text-white font-medium animate-book-drop" style={{ animationDelay: '0.5s' }}>Academic Strategies</div>
        </div>

        {/* Right Book Stack with Falling Animation */}
        <div className="hidden md:flex absolute right-4 lg:right-12 bottom-0 z-0 flex-col gap-1 w-32 lg:w-44 opacity-90 pointer-events-none select-none">
          <div className="h-8 lg:h-10 bg-[#3b5998] rounded-l-md border-r-4 border-[#1e2e4f] shadow-sm flex items-center justify-end px-3 text-[10px] lg:text-xs text-white font-medium animate-book-drop" style={{ animationDelay: '0.15s' }}>Subject Mastery</div>
          <div className="h-7 lg:h-9 bg-[#c2a68c] rounded-l-md border-r-4 border-[#8c6d53] shadow-sm flex items-center justify-end px-3 text-[10px] lg:text-xs text-slate-900 font-medium -translate-x-1 animate-book-drop" style={{ animationDelay: '0.25s' }}>Academic Success</div>
          <div className="h-9 lg:h-11 bg-[#556b2f] rounded-l-md border-r-4 border-[#2e3b18] shadow-sm flex items-center justify-end px-3 text-[10px] lg:text-xs text-white font-medium translate-x-1 animate-book-drop" style={{ animationDelay: '0.35s' }}>Academic Success</div>
          <div className="h-7 lg:h-9 bg-[#d3d3d3] rounded-l-md border-r-4 border-[#a9a9a9] shadow-sm flex items-center justify-end px-3 text-[10px] lg:text-xs text-slate-800 font-medium animate-book-drop" style={{ animationDelay: '0.45s' }}>Tutoring Essentials</div>
          <div className="h-8 lg:h-10 bg-[#2b3a4a] rounded-l-md border-r-4 border-[#0f172a] shadow-sm flex items-center justify-end px-3 text-[10px] lg:text-xs text-white font-medium -translate-x-1 animate-book-drop" style={{ animationDelay: '0.55s' }}>Higher Learning</div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a2a3a] mb-4 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-[#6b7a8a] text-base max-w-2xl mx-auto leading-relaxed">
            Find helpful answers about finding tutors, booking sessions,
            learning identity, student profiles, learning goals, courses,
            payments, account management, and staying safe on TutorLink Nepal.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-4 py-3.5 shadow-sm focus-within:border-[#1a2a3a] focus-within:ring-2 focus-within:ring-slate-100 transition">
              <span className="mr-3 text-slate-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions and answers..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab("all");
                setOpenFaq(null);
              }}
              className={`py-5 text-sm font-semibold transition border-b-2 ${
                activeTab === "all"
                  ? "border-[#1a2a3a] text-[#1a2a3a]"
                  : "border-transparent text-slate-500 hover:text-[#1a2a3a]"
              }`}
            >
              All FAQs
            </button>
            <button
              onClick={() => {
                setActiveTab("parent");
                setOpenFaq(null);
              }}
              className={`py-5 text-sm font-semibold transition border-b-2 ${
                activeTab === "parent"
                  ? "border-[#1a2a3a] text-[#1a2a3a]"
                  : "border-transparent text-slate-500 hover:text-[#1a2a3a]"
              }`}
            >
              For Parents
            </button>
            <button
              onClick={() => {
                setActiveTab("tutor");
                setOpenFaq(null);
              }}
              className={`py-5 text-sm font-semibold transition border-b-2 ${
                activeTab === "tutor"
                  ? "border-[#1a2a3a] text-[#1a2a3a]"
                  : "border-transparent text-slate-500 hover:text-[#1a2a3a]"
              }`}
            >
              For Tutors
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Count */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {filteredFaqs.length} question{filteredFaqs.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {filteredFaqs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#1a2a3a]">
              No questions found
            </h3>
            <p className="mt-2 text-sm text-[#6b7a8a]">
              Try a different search term or browse another category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition hover:border-slate-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-[#1a2a3a] text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <span
                    className={`text-[#1a2a3a] text-2xl font-light transition-transform flex-shrink-0 ${
                      openFaq === index ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-5 text-[#6b7a8a] text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Help;