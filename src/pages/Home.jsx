import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7EF] font-sans text-[#202020]">
      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-12 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-4">
          {/* ================= LEFT ================= */}
          <div className="max-w-[590px]">
            {/* TAG */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                bg-[#F7E8AE]
                rounded-full
                px-4
                py-1.5
                mb-4
                text-sm
                font-semibold
                text-[#202020]
              "
            >
              <span>Learn</span>
              <span>•</span>
              <span>Grow</span>
              <span>•</span>
              <span>Succeed</span>
            </div>

            {/* HEADING */}
            <h1
              className="
                text-[42px]
                sm:text-[50px]
                lg:text-[48px]
                xl:text-[52px]
                leading-[1.08]
                font-extrabold
                tracking-[-1.5px]
                mb-4
              "
            >
              Find the right tutor.
              <br />
              <span className="text-[#E7B735]">Learn with confidence.</span>
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                text-[#6B6B6B] text-[16px] leading-[1.55] max-w-[500px]
                mb-6
              "
            >
              TutorLink connects motivated learners with experienced tutors and
              students for personalized learning, anytime, anywhere.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <button
                onClick={() => navigate("/register?role=parent")}
                className="px-7 py-3 rounded-xl border-[1.5px] border-[#202020]
                  bg-[#EAF5F8] text-[#202020] font-semibold text-sm hover:bg-[#DDEFF3] transition"
              >
                I am a parent
              </button>

              <button
                onClick={() => navigate("/become-tutor")}
                className="px-7 py-3 rounded-xl border-[1.5px] border-[#202020] bg-transparent text-[#202020]
                 font-semibold text-sm hover:bg-[#202020] hover:text-white transition"
              >
                I am a teacher
              </button>
            </div>

            {/* LEARNERS */}
            <div className="flex items-center gap-3">
              {/* AVATARS */}
              <div className="flex items-center -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#C7A27C] border-2 border-[#FAF7EF]" />

                <div className="w-8 h-8 rounded-full bg-[#8B6F5A] border-2 border-[#FAF7EF]" />

                <div className="w-8 h-8 rounded-full bg-[#D9B28C] border-2 border-[#FAF7EF]" />

                <div className="w-8 h-8 rounded-full bg-[#92755F] border-2 border-[#FAF7EF]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#202020]">
                  10,000+ learners
                </p>

                <p className="text-[11px] text-[#777]">
                  have already found your perfect match
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT - CLEAN IMAGE ================= */}
          <div className="relative flex justify-center lg:justify-end">
            {/* "Better learning, brighter future" - LEFT SIDE */}
            <div className="absolute left-0 top-4 z-20 text-[#202020] text-sm leading-tight font-medium"></div>

            {/* MAIN IMAGE - Clean, no yellow patch */}
            <div className="relative z-10 w-full max-w-[540px] pt-5">
              <img
                src="https://lens.usercontent.google.com/banana?agsi=CmdnbG9iYWw6OjAwMDA1NWNmZWM3MDAyNmQ6MDAwMDAwZWI6MTpiMWY2ZjVhMjNiMzczODEwOjAwMDA1NWNmZWM3MDAyNmQ6MDAwMDAyZjc5YTUwMzM2ODowMDA2NWFmY2NiOTVhOTFmEAIYASIKaW1hZ2UvanBlZw=="
                className="
                  w-full
                  h-auto
                  object-contain
                  drop-shadow-sm
                "
              />
            </div>

            {/* SMALL DECORATION - BOTTOM LEFT */}
            <div className="absolute left-10 bottom-10 z-20 text-3xl">♡</div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-[#F7F3E8] border-t border-[#F1EBDD]">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* FEATURE 1 */}
            <div className="px-4 py-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F7D66D] text-xl">
                  ✅
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">
                    Verified Tutors
                  </h3>
                  <p className="text-xs leading-relaxed text-[#777]">
                    Background-checked and
                    <br />
                    trusted by our community.
                  </p>
                </div>
              </div>
            </div>

            {/* FEATURE 2 */}
            <div className="px-4 py-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F7D66D] text-xl">
                  🕐
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">
                    Flexible Sessions
                  </h3>
                  <p className="text-xs leading-relaxed text-[#777]">
                    Learn at your own pace,
                    <br />
                    anytime, anywhere.
                  </p>
                </div>
              </div>
            </div>

            {/* FEATURE 3 */}
            <div className="px-4 py-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F7D66D] text-xl">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">
                    Personalized Matching
                  </h3>
                  <p className="text-xs leading-relaxed text-[#777]">
                    Find the tutor (or student)
                    <br />
                    that fits your goals.
                  </p>
                </div>
              </div>
            </div>

            {/* FEATURE 4 */}
            <div className="px-4 py-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F7D66D] text-xl">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">
                    Track Your Progress
                  </h3>
                  <p className="text-xs leading-relaxed text-[#777]">
                    Achieve your goals with
                    <br />
                    real support and feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
