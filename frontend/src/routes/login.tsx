import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    login,
    register,
    loginError,
    registerError,
    isLoggingIn,
    isRegistering,
  } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      register({ email, password });
    } else {
      login({ email, password });
    }
  };

  const error = isRegister ? registerError : loginError;
  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-[#37352F] font-semibold text-lg">NavApp</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-semibold text-[#37352F] mb-2 tracking-tight">
              {isRegister ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-[#787774] text-[15px]">
              {isRegister
                ? "Start navigating with real-time directions"
                : "Sign in to continue to NavApp"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-[#E3E2DF] shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="notion-input"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="notion-input"
                  placeholder={
                    isRegister ? "Create a password" : "Enter your password"
                  }
                  required
                  minLength={6}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-[#FBE4E4] rounded-md text-[#E03E3E] text-[14px]">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#2F80ED] hover:bg-[#2671D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors text-[15px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isRegister ? "Creating account..." : "Signing in..."}
                  </span>
                ) : isRegister ? (
                  "Create account"
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E3E2DF]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[13px] text-[#9B9A97]">
                  or
                </span>
              </div>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F6F3] border border-[#E3E2DF] text-[#37352F] font-medium rounded-md transition-colors text-[15px]"
            >
              {isRegister
                ? "Sign in to existing account"
                : "Create new account"}
            </button>
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: "📍", label: "Live tracking" },
              { icon: "🗺️", label: "Route maps" },
              { icon: "⏱️", label: "Real-time ETA" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-[12px] text-[#787774]">
                  {feature.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-[13px] text-[#9B9A97]">
          Real-time navigation made simple
        </p>
      </footer>
    </div>
  );
}
