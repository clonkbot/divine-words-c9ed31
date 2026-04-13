import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { MainApp } from "./components/MainApp";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1a1f35] via-[#0a0e1a] to-[#050810]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4a574]/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8b3a3a]/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Decorative cross pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0h4v28h28v4H32v28h-4V32H0v-4h28V0z' fill='%23d4a574' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b3a3a] mb-4 shadow-2xl shadow-[#d4a574]/30">
            <svg className="w-10 h-10 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-[#f5f0e6] tracking-wide">Divine Words</h1>
          <p className="text-[#d4a574]/70 mt-2 font-serif italic">Scripture illuminated</p>
        </div>

        {/* Form card */}
        <div className="bg-gradient-to-b from-[#1a1f35]/80 to-[#0a0e1a]/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-[#d4a574]/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#d4a574] text-sm font-medium mb-2 uppercase tracking-wider">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-[#0a0e1a]/60 border border-[#d4a574]/30 rounded-lg text-[#f5f0e6] placeholder-[#d4a574]/40 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/50 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-[#d4a574] text-sm font-medium mb-2 uppercase tracking-wider">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-[#0a0e1a]/60 border border-[#d4a574]/30 rounded-lg text-[#f5f0e6] placeholder-[#d4a574]/40 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/50 transition-all"
                placeholder="Enter password"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <p className="text-[#e57373] text-sm text-center bg-[#8b3a3a]/20 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#d4a574] to-[#c4956a] text-[#0a0e1a] font-bold rounded-lg hover:from-[#e4b584] hover:to-[#d4a57a] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4a574]/20 uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                flow === "signIn" ? "Enter the Sanctuary" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-[#d4a574]/70 hover:text-[#d4a574] text-sm transition-colors"
            >
              {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d4a574]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0e1a] text-[#d4a574]/50">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full py-3 border border-[#d4a574]/30 text-[#d4a574] rounded-lg hover:bg-[#d4a574]/10 transition-all disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b3a3a] mb-4 animate-pulse">
            <svg className="w-8 h-8 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <p className="text-[#d4a574] animate-pulse">Preparing the sanctuary...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <MainApp />;
}
