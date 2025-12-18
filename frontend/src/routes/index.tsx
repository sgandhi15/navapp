import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate({ to: "/home", replace: true });
    } else {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#37352F]" />
    </div>
  );
}
