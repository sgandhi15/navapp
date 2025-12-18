import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate({ to: "/home", replace: true });
    } else {
      setIsChecking(false);
    }
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#1A73E8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] p-[3px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#EA4335]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-[#4285F4]/20 animate-ping" />
        </div>

        {/* Title */}
        <h1 className="text-[28px] sm:text-[36px] font-medium text-[#202124] text-center mb-3">
          NavApp
        </h1>
        <p className="text-[16px] text-[#5F6368] text-center mb-10 max-w-[280px]">
          Real-time navigation with live tracking
        </p>

        {/* CTA Buttons */}
        <div className="w-full max-w-[320px] space-y-3">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 px-6 bg-[#1A73E8] hover:bg-[#1557B0] active:scale-[0.98] text-white font-medium rounded-full transition-all duration-150 shadow-md hover:shadow-lg"
          >
            Get started
          </button>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 px-6 bg-white hover:bg-[#F8F9FA] active:scale-[0.98] text-[#1A73E8] font-medium rounded-full border border-[#DADCE0] transition-all duration-150"
          >
            Sign in
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-[400px]">
          {[
            { icon: "🗺️", label: "Live maps" },
            { icon: "📍", label: "GPS tracking" },
            { icon: "⏱️", label: "Real-time ETA" },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-[13px] text-[#5F6368]">{feature.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[12px] text-[#9AA0A6]">
          Navigate anywhere, anytime
        </p>
      </footer>
    </div>
  );
}
