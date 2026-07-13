"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { CenteredSpinner, Spinner } from "@/components/ui/Spinner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!user) return <CenteredSpinner message="Loading profile…" />;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err instanceof ApiError ? err.message : "Something went wrong." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Profile Settings</h2>
        <p className="text-lg text-on-surface-variant mt-1">Manage your account details and security preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {/* Left Column: Security */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="border-b border-surface-container-highest pb-4 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-xl font-bold text-primary tracking-tight">Security</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Current password</label>
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">New password</label>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  required 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" 
                />
              </div>
              
              {message.text && (
                <div className={`rounded-md text-sm px-3 py-2.5 ${message.type === 'error' ? 'bg-danger-container text-danger' : 'bg-success/10 text-success'}`}>
                  {message.text}
                </div>
              )}
              
              <div className="pt-2 mt-auto">
                <button disabled={loading} type="submit" className="w-full bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {loading ? <Spinner className="w-5 h-5 border-white" /> : (
                    <><span className="material-symbols-outlined text-[18px]">password</span> Update Password</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm h-full">
            <div className="border-b border-surface-container-highest pb-4 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="text-xl font-bold text-primary tracking-tight">Account Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-on-surface-variant">Email Address</label>
                <input className="border border-outline-variant rounded-lg px-4 py-3 bg-surface-container-low text-on-surface font-medium cursor-not-allowed" disabled type="email" value={user.email}/>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-on-surface-variant">System Role</label>
                <input className="border border-outline-variant rounded-lg px-4 py-3 bg-surface-container-low text-on-surface font-medium cursor-not-allowed" disabled type="text" value={user.role.replace("_", " ")}/>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <p className="text-sm text-on-surface-variant bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                  <span className="font-bold flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-[18px]">info</span> Note:</span> 
                  Your account details are linked to your registration. To change these details, please contact the system administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
