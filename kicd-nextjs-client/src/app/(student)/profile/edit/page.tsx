"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastContext";
import { CenteredSpinner } from "@/components/ui/Spinner";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwdState, setPwdState] = useState({ currentPassword: "", newPassword: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    university: "",
    courseName: "",
    admissionNumber: "",
    departmentId: "",
    profilePhotoUrl: "",
    gpa: "",
    gender: "",
    bio: "",
    yearOfStudy: "",
    phoneNumber: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, deptRes] = await Promise.all([
          api.get("/api/profile/me"),
          api.get("/api/departments")
        ]);

        setProfile(profRes);
        setDepartments(deptRes || []);

        if (profRes) {
          setState({
            firstName: profRes.firstName || "",
            lastName: profRes.lastName || "",
            university: profRes.university || "",
            courseName: profRes.courseName || "",
            admissionNumber: profRes.admissionNumber || "",
            departmentId: profRes.department?.departmentId?.toString() || "",
            profilePhotoUrl: profRes.profilePhotoUrl || "",
            gpa: profRes.gpa?.toString() || "",
            gender: profRes.gender || "",
            bio: profRes.bio || "",
            yearOfStudy: profRes.yearOfStudy?.toString() || "",
            phoneNumber: profRes.phoneNumber || ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const payload = {
        firstName: state.firstName,
        lastName: state.lastName,
        university: state.university,
        courseName: state.courseName,
        admissionNumber: state.admissionNumber || null,
        departmentId: state.departmentId ? parseInt(state.departmentId) : null,
        profilePhotoUrl: state.profilePhotoUrl || null,
        gpa: state.gpa ? parseFloat(state.gpa) : null,
        gender: state.gender || null,
        bio: state.bio || null,
        yearOfStudy: state.yearOfStudy ? parseInt(state.yearOfStudy) : null,
        phoneNumber: state.phoneNumber || null
      };

      await api.put(`/api/profile/${profile.studentId}`, payload);
      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/documents/upload", formData);
      setState(prev => ({ ...prev, profilePhotoUrl: res.fileUrl }));
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    try {
      await api.post("/api/auth/change-password", pwdState);
      toast.success("Password changed successfully!");
      setPasswordModalOpen(false);
      setPwdState({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading || !user) {
    return <CenteredSpinner message="Loading profile..." />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface p-gutter md:p-xl h-full flex flex-col max-w-[1440px] mx-auto w-full relative">
      {/* Header */}
      <header className="mb-xl flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary tracking-tight">Profile Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage your account details and academic preferences.</p>
        </div>
      </header>

      {/* Settings Grid (Bento style layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg max-w-[1200px] w-full mx-auto pb-3xl relative z-10">

        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-1 flex flex-col gap-lg">
          {/* Profile Photo Card */}
          <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
            <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} />

            <div className="relative mb-md group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {state.profilePhotoUrl ? (
                <img src={`http://localhost:8081${state.profilePhotoUrl}`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-sm" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-surface shadow-sm bg-primary-fixed flex items-center justify-center text-primary text-5xl font-bold">
                  {state.firstName ? state.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-primary-fixed-dim bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="material-symbols-outlined text-primary font-bold">photo_camera</span>
              </div>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">
              {state.firstName || state.lastName ? `${state.firstName} ${state.lastName}` : "Student Applicant"}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{user.email}</p>
            <button disabled={uploadingPhoto} onClick={() => fileInputRef.current?.click()} type="button" className="bg-surface-container text-primary border border-primary/20 px-md py-sm rounded-lg font-label-md text-label-md hover:bg-surface-subtle transition-colors w-full disabled:opacity-50">
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </button>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-sm">JPG, GIF or PNG. Max size of 2MB</p>
          </div>

          {/* Security Section */}
          <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="border-b border-border-light pb-sm mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Security</h3>
            </div>
            <div className="flex items-center justify-between mb-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface">Two-Factor Authentication</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Add an extra layer of security.</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" id="tfa_toggle" className="peer sr-only" />
                <label htmlFor="tfa_toggle" className="block overflow-hidden h-5 w-10 rounded-full bg-border-light cursor-pointer transition-colors duration-200 peer-checked:bg-primary before:content-[''] before:absolute before:top-1 before:left-1 before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform before:duration-200 peer-checked:before:translate-x-5"></label>
              </div>
            </div>
            <button onClick={() => setPasswordModalOpen(true)} className="text-primary hover:text-primary-container font-label-md text-label-md text-left flex items-center gap-xs mt-auto self-start transition-colors">
              <span className="material-symbols-outlined text-sm">password</span> Change Password
            </button>
          </div>
        </div>

        {/* Right Column: Details & Preferences */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          {/* Account Details Form */}
          <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm hover:shadow-md transition-all">
            <div className="border-b border-border-light pb-sm mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Applicant Profile Details</h3>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">First Name *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.firstName}
                  onChange={e => setState({ ...state, firstName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Last Name *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.lastName}
                  onChange={e => setState({ ...state, lastName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs md:col-span-2">
                <label className="font-label-sm text-label-sm text-text-secondary">University/Institution *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.university}
                  onChange={e => setState({ ...state, university: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Course Name *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.courseName}
                  onChange={e => setState({ ...state, courseName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Admission Number *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.admissionNumber}
                  onChange={e => setState({ ...state, admissionNumber: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Phone Number *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="text"
                  value={state.phoneNumber}
                  onChange={e => setState({ ...state, phoneNumber: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Year of Study *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="number"
                  min="1"
                  max="7"
                  value={state.yearOfStudy}
                  onChange={e => setState({ ...state, yearOfStudy: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Current GPA *</label>
                <input
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={state.gpa}
                  onChange={e => setState({ ...state, gpa: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-xs md:col-span-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Gender *</label>
                <select
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  value={state.gender}
                  onChange={e => setState({ ...state, gender: e.target.value })}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              <div className="flex flex-col gap-xs md:col-span-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Bio *</label>
                <textarea
                  required
                  rows={4}
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  value={state.bio}
                  onChange={e => setState({ ...state, bio: e.target.value })}
                  placeholder="Tell us a little bit about yourself..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-xs md:col-span-2 mt-sm">
                <label className="font-label-sm text-label-sm text-text-secondary">Target Department Preference *</label>
                <select
                  required
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  value={state.departmentId}
                  onChange={e => setState({ ...state, departmentId: e.target.value })}
                >
                  <option value="" disabled>Select a department</option>
                  {departments.map(d => (
                    <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-md mt-md pt-md border-t border-border-light">
                <button onClick={() => router.push("/dashboard")} type="button" className="text-on-surface hover:bg-surface-container px-lg py-sm rounded-lg font-label-md transition-colors">
                  Cancel
                </button>
                <button disabled={saving} type="submit" className="bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {saving ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm hover:shadow-md transition-all">
            <div className="border-b border-border-light pb-sm mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">notifications</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Notification Preferences</h3>
            </div>
            <div className="flex flex-col gap-md">
              <div className="flex items-center justify-between p-md border border-border-light rounded-lg hover:bg-surface-subtle transition-colors">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-text-secondary mt-xs">mail</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Email Notifications</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Receive updates on applications and system alerts via email.</p>
                  </div>
                </div>
                <div className="relative inline-block w-10 ml-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                  <input type="checkbox" id="email_toggle" className="peer sr-only" defaultChecked />
                  <label htmlFor="email_toggle" className="block overflow-hidden h-5 w-10 rounded-full bg-border-light cursor-pointer transition-colors duration-200 peer-checked:bg-primary before:content-[''] before:absolute before:top-1 before:left-1 before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform before:duration-200 peer-checked:before:translate-x-5"></label>
                </div>
              </div>
              <div className="flex items-center justify-between p-md border border-border-light rounded-lg hover:bg-surface-subtle transition-colors">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-text-secondary mt-xs">sms</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">SMS Notifications</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Receive urgent alerts and OTPs via SMS.</p>
                  </div>
                </div>
                <div className="relative inline-block w-10 ml-2 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                  <input type="checkbox" id="sms_toggle" className="peer sr-only" />
                  <label htmlFor="sms_toggle" className="block overflow-hidden h-5 w-10 rounded-full bg-border-light cursor-pointer transition-colors duration-200 peer-checked:bg-primary before:content-[''] before:absolute before:top-1 before:left-1 before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform before:duration-200 peer-checked:before:translate-x-5"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface-default p-lg rounded-xl max-w-[448px] w-full mx-4 shadow-lg border border-border-light">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Change Password</h3>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">Current Password</label>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  value={pwdState.currentPassword}
                  onChange={e => setPwdState({ ...pwdState, currentPassword: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-text-secondary">New Password</label>
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  className="border border-border-light rounded-lg px-md py-sm bg-surface-default text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all duration-200"
                  value={pwdState.newPassword}
                  onChange={e => setPwdState({ ...pwdState, newPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-md mt-md">
                <button type="button" onClick={() => setPasswordModalOpen(false)} className="text-on-surface hover:bg-surface-container px-lg py-sm rounded-lg font-label-md transition-colors">
                  Cancel
                </button>
                <button disabled={changingPwd} type="submit" className="bg-primary text-white hover:bg-primary-container hover:text-on-primary-container px-lg py-sm rounded-lg font-label-md text-label-md transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {changingPwd ? "Saving..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
