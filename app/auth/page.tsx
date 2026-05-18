"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Tent, Star } from "lucide-react";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>("signin");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [name,    setName]    = useState("");
  const [company, setCompany] = useState("");
  const [phone,   setPhone]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [info,    setInfo]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim()) return setError("Email is required.");
    if (pass.length < 6) return setError("Password must be at least 6 characters.");
    if (tab === "signup" && !name.trim()) return setError("Full name is required.");

    setLoading(true);
    try {
      if (tab === "signin") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      router.replace("/dashboard");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
        setError("Incorrect email or password.");
      else if (code === "auth/email-already-in-use")
        setError("An account with this email already exists. Sign in instead.");
      else if (code === "auth/weak-password")
        setError("Password is too weak. Use at least 6 characters.");
      else
        setError(err?.message ?? "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) return setError("Enter your email address first.");
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo(`Password reset email sent to ${email}`);
    } catch {
      setError("Could not send reset email. Check the address and try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 page-enter">
      {/* Background decoration circles */}
      <div className="fixed top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #C8922A 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, #40916C 0%, transparent 70%)" }} />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(200,146,42,0.2)", border: "1px solid rgba(200,146,42,0.4)" }}>
              <Tent size={24} color="#C8922A" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "var(--font-playfair)", color: "#F2D080" }}>
                KuFull CHARGE
              </h1>
              <p className="text-xs tracking-[0.25em] uppercase" style={{ color: "rgba(200,146,42,0.7)" }}>
                Plan · Pack · Camp
              </p>
            </div>
          </div>
          <p className="text-sm" style={{ color: "rgba(212,200,184,0.6)" }}>
            Your all-in-one safari camp management platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-7"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["signin","signup"] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setInfo(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: tab === t ? "rgba(200,146,42,0.25)" : "transparent",
                  color: tab === t ? "#F2D080" : "rgba(255,255,255,0.45)",
                  border: tab === t ? "1px solid rgba(200,146,42,0.4)" : "1px solid transparent",
                }}>
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "signup" && (
              <>
                <div>
                  <label className="section-label block mb-1.5">Full Name *</label>
                  <input className="glass-input" placeholder="e.g. John Kamau"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Company (optional)</label>
                  <input className="glass-input" placeholder="e.g. Safari Co. Ltd"
                    value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Phone (optional)</label>
                  <input className="glass-input" placeholder="+254 7XX XXX XXX" type="tel"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="section-label block mb-1.5">Email *</label>
              <input className="glass-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div>
              <label className="section-label block mb-1.5">Password *</label>
              <input className="glass-input" type="password" placeholder="••••••••"
                value={pass} onChange={e => setPass(e.target.value)} autoComplete={tab === "signin" ? "current-password" : "new-password"} />
            </div>

            {error && (
              <div className="text-sm px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,90,60,0.15)", color: "#FF7A5A", border: "1px solid rgba(255,90,60,0.25)" }}>
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm px-4 py-2.5 rounded-xl" style={{ background: "rgba(82,199,136,0.15)", color: "#52C788", border: "1px solid rgba(82,199,136,0.25)" }}>
                {info}
              </div>
            )}

            <button type="submit" className="gold-btn w-full mt-1" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {tab === "signin" ? "Sign In" : "Create Account"}
            </button>

            {tab === "signin" && (
              <button type="button" onClick={handleForgot}
                className="text-center text-sm transition-colors"
                style={{ color: "rgba(200,146,42,0.7)" }}
                onMouseOver={e => (e.currentTarget.style.color = "#C8922A")}
                onMouseOut={e => (e.currentTarget.style.color = "rgba(200,146,42,0.7)")}>
                Forgot password?
              </button>
            )}
          </form>
        </div>

        {/* Stars */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(212,200,184,0.35)" }}>
          ✦ KuFull CHARGE · Professional Edition · v1.0 ✦
        </p>
      </div>
    </div>
  );
}
