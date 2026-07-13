"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [bannerError, setBannerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password }, { auth: false });
      login(res);

      if (res.role === "STUDENT") {
        if (sessionStorage.getItem('kicd_pending_opportunity')) {
          router.push(`/apply/${sessionStorage.getItem('kicd_pending_opportunity')}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/reviewer/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        setBannerError(err.message);
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
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-on-surface-variant">Sign in to the KICD Attachment System</p>
      </div>
      
      <div className="glass-card rounded-2xl border border-outline-variant p-8 sm:p-10 overflow-hidden relative shadow-lg bg-white/95 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
              <Link className="text-xs font-semibold text-primary hover:text-primary-container transition-colors" href="/forgot-password">Forgot Password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <input 
                className="block w-full pl-12 pr-12 py-3 border border-outline-variant rounded-lg text-on-surface bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline cursor-pointer hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
            {fieldErrors.password && <div className="text-danger text-sm mt-1">{fieldErrors.password}</div>}
          </div>
          
          {bannerError && (
            <div className={`rounded-md text-sm px-3 py-2.5 ${bannerError.toLowerCase().includes('locked') ? 'bg-warning-container text-warning' : 'bg-danger-container text-danger'}`}>
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
                  Login
                  <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-on-surface-variant">
          Don't have an account?{" "} 
          <Link className="text-sm font-semibold text-primary hover:text-primary-container transition-colors underline-offset-4 hover:underline" href="/register">Apply Now</Link>
        </p>
      </div>
    </div>
  );
}
