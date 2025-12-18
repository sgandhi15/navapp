import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoggingIn, isRegistering, loginError, registerError, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const isLoading = isLoggingIn || isRegistering;
  const error = loginError || registerError;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/home", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (isSignUp) {
      register({ email, password }, {
        onSuccess: () => showToast("Account created successfully!", "success"),
      });
    } else {
      login({ email, password }, {
        onSuccess: () => showToast("Welcome back!", "success"),
      });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="p-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F1F3F4] transition-colors"
        >
          <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#EA4335] p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#4285F4]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-normal text-[#202124] mb-2">
          {isSignUp ? "Create account" : "Sign in"}
        </h1>
        <p className="text-[16px] text-[#5F6368] mb-8">
          to continue to NavApp
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          {/* Error */}
          {displayError && (
            <div className="mb-4 p-3 bg-[#FCE8E6] rounded-lg flex items-center gap-3 animate-scaleIn">
              <svg className="w-5 h-5 text-[#EA4335] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[14px] text-[#202124]">{displayError}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 text-[16px] text-[#202124] border border-[#DADCE0] rounded-lg outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#5F6368] bg-white px-1 transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[16px] peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-[#1A73E8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Email
              </label>
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-5 pb-2 pr-12 text-[16px] text-[#202124] border border-[#DADCE0] rounded-lg outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#5F6368] bg-white px-1 transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[16px] peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-[#1A73E8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5F6368] hover:text-[#202124]"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <div className="mb-4 animate-slideUp">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-5 pb-2 text-[16px] text-[#202124] border border-[#DADCE0] rounded-lg outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all"
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#5F6368] bg-white px-1 transition-all pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[16px] peer-focus:top-0 peer-focus:text-[12px] peer-focus:text-[#1A73E8] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[12px]"
                >
                  Confirm password
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setLocalError("");
              }}
              className="text-[14px] font-medium text-[#1A73E8] hover:bg-[#E8F0FE] px-3 py-2 rounded-md transition-colors"
            >
              {isSignUp ? "Sign in instead" : "Create account"}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-md transition-all active:scale-[0.98] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </>
              ) : isSignUp ? (
                "Create"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="p-6 flex items-center justify-between text-[12px] text-[#5F6368]">
        <span>English (United States)</span>
        <div className="flex items-center gap-4">
          <button className="hover:text-[#202124] transition-colors">Help</button>
          <button className="hover:text-[#202124] transition-colors">Privacy</button>
          <button className="hover:text-[#202124] transition-colors">Terms</button>
        </div>
      </footer>
    </div>
  );
}
