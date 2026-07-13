"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too short", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-success" },
  { label: "Strong", color: "bg-success" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const score = scorePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError("");
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", { email, password }, { auth: false });
      login(res);
      
      if (sessionStorage.getItem('kicd_pending_opportunity')) {
        router.push(`/apply/${sessionStorage.getItem('kicd_pending_opportunity')}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        else setBannerError(err.message);
      } else {
        setBannerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-container text-on-primary-container shadow-sm mb-4">
          <span className="material-symbols-outlined text-3xl">school</span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">KICD</h1>
        <p className="text-on-surface-variant">Applicant Registration</p>
      </div>

      <div className="glass-card rounded-2xl border border-outline-variant p-8 sm:p-10 overflow-hidden relative shadow-lg bg-white/95 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                id="email" 
                name="email" 
                placeholder="you@student.ac.ke" 
                required 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {fieldErrors.email && <div className="text-danger text-sm mt-1">{fieldErrors.email}</div>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                id="password" 
                name="password" 
                placeholder="Create a password" 
                required 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-2 flex gap-1 h-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? STRENGTH[score].color : "bg-outline-variant"}`}></div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">{password ? STRENGTH[score].label : "At least 8 characters"}</p>
            {fieldErrors.password && <div className="text-danger text-sm mt-1">{fieldErrors.password}</div>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-xl">lock_reset</span>
              </div>
              <input 
                className="block w-full pl-12 pr-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                id="confirmPassword" 
                name="confirm" 
                placeholder="Confirm your password" 
                required 
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
            {fieldErrors.confirm && <div className="text-danger text-sm mt-1">{fieldErrors.confirm}</div>}
          </div>
          
          {bannerError && (
            <div className="rounded-md bg-danger-container text-danger text-sm px-3 py-2.5">
              {bannerError}
            </div>
          )}
          
          <div className="pt-2">
            <button 
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-base text-white bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
            >
              {loading ? <Spinner className="w-5 h-5 border-white" /> : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link className="text-sm font-semibold text-primary hover:text-primary-container transition-colors underline-offset-4 hover:underline" href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
