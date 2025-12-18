import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate({ to: "/home", replace: true });
    } else {
      setChecking(false);
    }
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#37352F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#37352F] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
          <span className="font-semibold text-[#37352F] text-lg">NavApp</span>
        </div>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="text-[14px] text-[#37352F] hover:bg-[#F7F6F3] px-4 py-2 rounded-lg transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center max-w-xl">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>

          <h1 className="text-[36px] sm:text-[48px] font-bold text-[#37352F] tracking-tight mb-4">
            Navigate anywhere
          </h1>
          <p className="text-[18px] text-[#787774] mb-10 max-w-md mx-auto">
            Real-time navigation with live tracking. Get directions and
            estimated arrival times instantly.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate({ to: "/login" })}
            className="px-8 py-3.5 bg-[#2F80ED] hover:bg-[#2671D9] text-white text-[16px] font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Get started — it's free
          </button>

          {/* Features */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#E7F0FD] flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-[#2F80ED]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              <p className="text-[13px] text-[#787774]">Live GPS tracking</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#DBEDDB] flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-[#0F7B6C]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-[13px] text-[#787774]">Real-time ETA</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FBF3DB] flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-[#9D6B0A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <p className="text-[13px] text-[#787774]">Save destinations</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
