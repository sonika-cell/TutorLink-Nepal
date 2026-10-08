import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function BecomeTutor() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState(0);
  const sectionRef = useRef(null);

  // Intersection Observer for the "Who Can Teach" grid animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCards(0);
          let current = 0;
          const interval = setInterval(() => {
            current += 1;
            setVisibleCards(current);
            if (current >= 6) clearInterval(interval);
          }, 350);

          return () => clearInterval(interval);
        } else {
          setVisibleCards(0);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const tutorTypes = [
    {
      title: "School & College Teachers",
      icon: "👨‍🏫",
      desc: "Bring your classroom experience online and help students learn with confidence.",
    },
    {
      title: "University Students",
      icon: "🎓",
      desc: "Share the subjects you’re good at, help younger learners, and earn on your own schedule.",
    },
    {
      title: "Subject Experts",
      icon: "💡",
      desc: "Turn your knowledge and expertise into personalized learning experiences for students.",
    },
    {
      title: "Skill Instructors",
      icon: "💻",
      desc: "Teach practical skills such as coding, design, languages, music, and more.",
    },
    {
      title: "Exam Preparation Tutors",
      icon: "📝",
      desc: "Help students prepare for SEE, +2, entrance exams, IELTS, Lok Sewa, and other important exams.",
    },
    {
      title: "Passionate Learners",
      icon: "🌱",
      desc: "If you love learning and helping others, share what you know and grow together.",
    },
  ];

  return (
    <div className="w-full font-sans min-h-screen bg-white flex flex-col relative overflow-hidden">
      
      {/* Custom Keyframe Animations for Realistic Falling Books */}
      <style>{`
        @keyframes dropBookRealistic {
          0% {
            transform: translateY(-320px) rotate(-22deg) scale(0.9);
            opacity: 0;
          }
          65% {
            transform: translateY(12px) rotate(5deg) scale(1);
            opacity: 1;
          }
          82% {
            transform: translateY(-6px) rotate(-2deg) scale(1);
          }
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes boyFadeIn {
          0% {
            transform: scale(0.5) translateY(-30px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes pageFlip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-20deg); }
        }

        .book-1 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 0.2s forwards; opacity: 0; }
        .book-2 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 0.5s forwards; opacity: 0; }
        .book-3 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 0.8s forwards; opacity: 0; }
        .book-4 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 1.1s forwards; opacity: 0; }
        .book-5 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 1.4s forwards; opacity: 0; }
        .book-6 { animation: dropBookRealistic 0.65s cubic-bezier(0.25, 1, 0.5, 1.25) 1.7s forwards; opacity: 0; }
        
        .boy-container { animation: boyFadeIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.0s forwards; opacity: 0; }
        .reading-book { animation: pageFlip 2s ease-in-out infinite; transform-origin: center; }
      `}</style>

      {/* 1. Top Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 w-full relative z-10 flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Side Content */}
        <div className="max-w-xl text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1a2a3a] tracking-tight mb-4 leading-tight">
            Empowering mind, <br />
            Inspiring future..
          </h1>

          <p className="text-[#6b7a8a] text-sm sm:text-base font-normal mb-6 leading-relaxed">
            You don’t need to be a professional teacher to make a difference. If you have knowledge, skills, and a passion for helping others learn, there’s a place for you on TutorLink Nepal.
          </p>

          <div className="flex flex-col items-start gap-4">
            <div className="text-[#e8a838] text-xl font-bold">✦</div>
            
            <button 
              onClick={() => navigate("/register?role=tutor")}
              className="bg-[#e8a838] hover:bg-[#d49730] text-[#1a2a3a] font-bold text-sm px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(232,168,56,0.4)] transition-all transform active:scale-95"
            >
              Apply Now Free
            </button>
          </div>
        </div>

        {/* Right Side: Stack of Real Illustrated Books + Reading Boy */}
        <div className="relative w-full md:w-[380px] h-[410px] flex flex-col items-center justify-end mt-12 md:mt-0">
          
          {/* Sitting Boy Reading on Top */}
          <div className="boy-container absolute bottom-[225px] z-30 flex flex-col items-center">
            <div className="relative bg-[#1a2a3a] w-24 h-24 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
              <div className="absolute top-2 w-12 h-4 bg-slate-900 rounded-t-full"></div>
              <span className="text-3xl select-none">👦👓</span>
              
              <div className="reading-book absolute -bottom-3 bg-white border border-slate-300 w-14 h-8 rounded shadow-md flex items-center justify-center text-[10px] font-bold text-slate-800">
                📖
              </div>
            </div>
          </div>

          {/* Stack of 6 Actual Illustrated Vector Books with Spine & Page Layers */}
          <div className="relative w-[300px] flex flex-col items-center pb-2">
            
            {/* Book 6 (Top: Notebook / Literature Book with Bookmark) */}
            <div className="book-6 w-[210px] h-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-md shadow-lg border border-amber-600/50 flex items-center px-3 justify-between z-20 mb-[-5px] relative">
              {/* Spine Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-amber-600 rounded-l-md opacity-80"></div>
              {/* White Page block sides */}
              <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/60"></div>
              {/* Bookmark hanging out */}
              <div className="absolute -left-3 bottom-[-6px] w-3 h-5 bg-rose-600 clip-bookmark shadow-sm rotate-12"></div>
              
              <span className="text-[10px] font-black text-slate-900 tracking-wider pl-4 drop-shadow-sm">STUDENT NOTEBOOK</span>
              <div className="w-3 h-3 bg-white rounded-full shadow-inner flex items-center justify-center text-[8px] font-bold text-amber-700">✍</div>
            </div>

            {/* Book 5 (Science Lab Book) */}
            <div className="book-5 w-[228px] h-10 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-md shadow-lg border border-emerald-900/50 flex items-center px-3 justify-between z-20 mb-[-5px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-emerald-900 rounded-l-md opacity-80"></div>
              <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/60"></div>
              
              <span className="text-[10px] font-black text-white tracking-wider pl-4 drop-shadow">SCIENCE & LAB</span>
              <div className="w-3 h-3 bg-emerald-300 rounded-sm shadow-inner flex items-center justify-center text-[8px] text-emerald-900 font-bold">🧪</div>
            </div>

            {/* Book 4 (English Literature Book) */}
            <div className="book-4 w-[246px] h-10 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 rounded-md shadow-lg border border-rose-900/50 flex items-center px-3 justify-between z-20 mb-[-5px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-rose-900 rounded-l-md opacity-80"></div>
              <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/60"></div>
              
              <span className="text-[10px] font-black text-white tracking-wider pl-4 drop-shadow">ENGLISH LITERATURE</span>
              <div className="w-3 h-3 bg-pink-200 rounded-sm shadow-inner flex items-center justify-center text-[8px] text-rose-900 font-bold">Aa</div>
            </div>

            {/* Book 3 (World Atlas & Geography) */}
            <div className="book-3 w-[264px] h-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-md shadow-lg border border-indigo-900/50 flex items-center px-3 justify-between z-20 mb-[-5px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-indigo-950 rounded-l-md opacity-80"></div>
              <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/60"></div>
              
              <span className="text-[10px] font-black text-white tracking-wider pl-4 drop-shadow">WORLD ATLAS & GEO</span>
              <div className="w-3 h-3 bg-blue-200 rounded-sm shadow-inner flex items-center justify-center text-[8px] text-indigo-900 font-bold">🌍</div>
            </div>

            {/* Book 2 (Physics & Mechanics) */}
            <div className="book-2 w-[282px] h-10 bg-gradient-to-r from-cyan-600 via-teal-700 to-cyan-800 rounded-md shadow-lg border border-cyan-950/50 flex items-center px-3 justify-between z-20 mb-[-5px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-cyan-950 rounded-l-md opacity-80"></div>
              <div className="absolute right-1 top-0 bottom-0 w-2 bg-white/60"></div>
              
              <span className="text-[10px] font-black text-white tracking-wider pl-4 drop-shadow">PHYSICS & MECHANICS</span>
              <div className="w-3 h-3 bg-cyan-200 rounded-sm shadow-inner flex items-center justify-center text-[8px] text-cyan-950 font-bold">⚡</div>
            </div>

            {/* Book 1 (Base - Math Book using your exact Dreamstime vector book image) */}
            <div className="book-1 w-[300px] h-11 bg-white rounded-md shadow-2xl border-2 border-slate-400 flex items-center px-2 justify-between z-20 relative overflow-hidden">
              <img 
                src="https://thumbs.dreamstime.com/b/school-book-vector-illustration-math-school-book-bookmark-mathematics-signs-cover-isolated-white-background-school-316459602.jpg" 
                alt="Math School Book" 
                className="w-full h-full object-cover absolute inset-0 opacity-95"
              />
              <div className="relative z-10 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                MATH BOOK
              </div>
              <span className="relative z-10 text-[9px] font-extrabold text-white bg-pink-600 px-1.5 py-0.5 rounded shadow">
                # + − × ÷
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 2. "Who Can Teach" Grid Section */}
      <div ref={sectionRef} className="max-w-6xl mx-auto px-6 pt-24 pb-16 w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a2a3a] tracking-tight mb-3">
            Who Can Teach on TutorLink Nepal?
          </h2>
          <p className="text-[#6b7a8a] text-sm sm:text-base max-w-2xl mx-auto">
            Explore who can join our community and start sharing knowledge across Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {tutorTypes.map((item, index) => {
            const isVisible = index < visibleCards;
            return (
              <div
                key={index}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(40px)",
                  transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
                }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-100 flex flex-col justify-between transition-all transform hover:-translate-y-1 group"
              >
                <div>
                  <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a2a3a] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6b7a8a] text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <button 
                  onClick={() => navigate("/register?role=tutor")}
                  className="text-[#e8a838] font-semibold text-sm flex items-center gap-1 hover:text-[#d49730] transition"
                >
                  Learn more <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 pb-20">
          <button 
            onClick={() => navigate("/register?role=tutor")}
            className="bg-[#e8a838] hover:bg-[#d49730] text-[#1a2a3a] font-bold text-base px-10 py-4 rounded-2xl shadow-[0_0_15px_rgba(232,168,56,0.4)] transition-all transform active:scale-95"
          >
            Become a Tutor
          </button>
        </div>
      </div>

      {/* 3. "How It Works" Section */}
      <section className="w-full bg-slate-50 border-t border-slate-100 py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a2a3a] tracking-tight mb-4">
              Start Your Tutoring Journey.
            </h2>
            <p className="text-[#6b7a8a] text-lg leading-relaxed">
              From creating your profile to connecting with your first student, TutorLink Nepal makes it simple to start teaching and grow your tutoring journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* CARD 01 */}
            <div className="bg-white border border-slate-200 rounded-3xl pt-8 px-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 transform hover:-translate-y-2 group">
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                  01
                </div>
                <h3 className="text-2xl font-bold text-[#1a2a3a] mb-3">Apply to become a tutor.</h3>
                <p className="text-[#6b7a8a] text-sm leading-relaxed mb-8">
                  Tell us about yourself, your education, expertise, teaching experience, and the subjects you’re ready to teach.
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-100 -mx-8 px-8 py-6 h-56 flex items-center justify-center">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <div className="mb-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-xs font-medium text-slate-700">Aayush Shrestha</div>
                  </div>
                  <div className="mb-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subjects You Teach</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 text-xs font-medium text-slate-700">Mathematics, Physics</div>
                  </div>
                  <button className="w-full bg-[#e8a838] hover:bg-[#d49730] text-[#1a2a3a] rounded-lg py-2 text-xs font-bold mt-2 transition-all">Submit Application</button>
                </div>
              </div>
            </div>

            {/* CARD 02 */}
            <div className="bg-white border border-slate-200 rounded-3xl pt-8 px-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 transform hover:-translate-y-2 group">
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                  02
                </div>
                <h3 className="text-2xl font-bold text-[#1a2a3a] mb-3">Get verified & discovered.</h3>
                <p className="text-[#6b7a8a] text-sm leading-relaxed mb-8">
                  Complete your profile and go through our verification process. Once approved, students can discover you easily.
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-100 -mx-8 px-8 py-6 h-56 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute bg-white border border-slate-200 rounded-2xl w-[90%] h-32 top-6 opacity-60"></div>
                  <div className="relative bg-white border border-slate-200 rounded-2xl p-4 w-full shadow-md z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-white font-bold text-sm relative shrink-0">
                        AS
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-white">✓</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1a2a3a]">Aayush Shrestha</h4>
                        <p className="text-[10px] text-[#6b7a8a]">Math Expert • 3+ yrs exp</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">Grade 11-12</span>
                      <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">SEE Prep</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                      <span className="text-amber-600 font-bold text-xs">★ 4.9 (42)</span>
                      <span className="text-[#e8a838] font-bold text-[10px]">View Profile →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 03 */}
            <div className="bg-white border border-slate-200 rounded-3xl pt-8 px-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 transform hover:-translate-y-2 group lg:col-span-1 md:col-span-2">
              <div>
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                  03
                </div>
                <h3 className="text-2xl font-bold text-[#1a2a3a] mb-3">Teach, connect & grow.</h3>
                <p className="text-[#6b7a8a] text-sm leading-relaxed mb-8">
                  Connect with students, schedule lessons, teach your way, and build your reputation through great learning experiences.
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-100 -mx-8 px-8 py-6 h-56 flex items-center justify-center relative">
                <div className="w-full flex gap-2 group-hover:scale-105 transition-transform duration-500">
                  <div className="flex-[2] bg-[#1a2a3a] h-28 rounded-xl flex items-end p-2 shadow-inner">
                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">You (Tutor)</span>
                  </div>
                  <div className="flex-[1] bg-[#6b7a8a] h-28 rounded-xl flex items-end p-2 shadow-inner">
                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Student</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-0 right-0 mx-auto w-[85%] bg-white border border-slate-200 p-3 rounded-xl shadow-lg flex justify-between items-center group-hover:-translate-y-1 transition-transform duration-500 delay-75">
                  <span className="text-[11px] font-bold text-[#1a2a3a]">📅 Lesson Booked</span>
                  <span className="text-[11px] font-bold text-emerald-600">+NPR 1,200</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Final Bottom Call-to-Action Section */}
      <section className="w-full bg-white py-24 px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1a2a3a] tracking-tight mb-4">
            freedom to teach. power to inspire.
          </h2>
          <p className="text-[#6b7a8a] text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
            You don’t need a classroom to change a life. Just your time, your wisdom, and your will.
          </p>
          <button 
            onClick={() => navigate('/register?role=tutor')}
            className="bg-[#e8a838] hover:bg-[#d49730] text-[#1a2a3a] font-bold text-base px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(232,168,56,0.3)] transition-all transform active:scale-95"
          >
            Become a tutor
          </button>
        </div>
      </section>
      

    </div>
  );
}