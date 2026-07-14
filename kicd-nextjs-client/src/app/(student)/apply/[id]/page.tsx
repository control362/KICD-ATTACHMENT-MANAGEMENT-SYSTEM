"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { API_BASE_URL } from "@/lib/config";
import { getToken } from "@/lib/auth";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const STEPS = ["Review Profile", "Required Documents", "Review & Submit"];

export default function ApplyWizard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const { id: opportunityId } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [step, setStep] = useState(0);
  const [application, setApplication] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [opportunity, setOpportunity] = useState<any>(null);

  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    university: "",
    courseName: "",
    admissionNumber: "",
    departmentId: "",
    yearOfStudy: "",
    phoneNumber: "",
    gpa: "",
    gender: "",
    bio: "",
    idDocumentPath: "",
    cvDocumentPath: "",
  });

  const [departments, setDepartments] = useState<any[]>([]);

  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    async function initWizard() {
      if (!opportunityId) {
        router.push("/opportunities");
        return;
      }
      
      initialized.current = true;

      try {
        const [opp, app, prof, deptRes] = await Promise.all([
          api.get(`/api/opportunities/${opportunityId}`, { auth: false }),
          api.post(`/api/applications/opportunity/${opportunityId}`),
          api.get("/api/profile/me"),
          api.get("/api/departments")
        ]);

        setOpportunity(opp);
        setApplication(app);
        setProfile(prof);
        setDepartments(deptRes || []);

        setState({
          firstName: prof?.firstName || "",
          lastName: prof?.lastName || "",
          university: prof?.university || "",
          courseName: prof?.courseName || "",
          admissionNumber: prof?.admissionNumber || "",
          departmentId: prof?.department?.departmentId?.toString() || "",
          yearOfStudy: prof?.yearOfStudy?.toString() || "",
          phoneNumber: prof?.phoneNumber || "",
          gpa: prof?.gpa?.toString() || "",
          gender: prof?.gender || "",
          bio: prof?.bio || "",
          idDocumentPath: app?.resumeUrl ? "" : "", 
          cvDocumentPath: "",
        });

        sessionStorage.removeItem("kicd_pending_opportunity");
        sessionStorage.removeItem("kicd_pending_department");

      } catch (err: any) {
        if (err.message === "You have already applied for this opportunity.") {
          router.push("/application/status");
          return;
        }
        setError(err.message || "Could not start application.");
      } finally {
        setLoading(false);
      }
    }
    initWizard();
  }, [opportunityId, router]);

  const handleNext = () => {
    // Validation for step 0
    if (step === 0) {
      if (!state.firstName || !state.lastName || !state.university || !state.courseName || !state.admissionNumber || !state.departmentId || !state.yearOfStudy || !state.phoneNumber || !state.gpa || !state.gender || !state.bio) {
        toast.error("Please fill in all required profile details.");
        return;
      }
    }
    setStep(Math.min(STEPS.length - 1, step + 1));
  };

  const handleBack = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'idDocumentPath' | 'cvDocumentPath', setUploading: (val: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Upload failed");
      }

      const data = await res.json();
      setState(s => ({ ...s, [key]: data.fileUrl }));
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profileDto = {
        firstName: state.firstName,
        lastName: state.lastName,
        university: state.university,
        courseName: state.courseName,
        admissionNumber: state.admissionNumber || null,
        departmentId: state.departmentId ? parseInt(state.departmentId) : null,
        profilePhotoUrl: profile?.profilePhotoUrl || null,
        gpa: state.gpa ? parseFloat(state.gpa) : null,
        gender: state.gender || null,
        bio: state.bio || null,
        yearOfStudy: state.yearOfStudy ? parseInt(state.yearOfStudy) : null,
        phoneNumber: state.phoneNumber || null
      };

      await api.put(`/api/profile/${profile.studentId}`, profileDto);

      await api.put(`/api/applications/${application.applicationId}/submit`, {
        resumeUrl: state.cvDocumentPath,
        idDocumentUrl: state.idDocumentPath
      });

      toast.success("Application submitted successfully.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const executeCancel = async () => {
    try {
      if (application?.applicationId) {
        await api.delete(`/api/applications/${application.applicationId}`);
      }
      toast.success("Draft discarded.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Could not cancel application.");
    } finally {
      setShowCancelModal(false);
    }
  };

  if (loading) return <CenteredSpinner message="Starting application…" />;
  if (error) return <div className="text-center py-16"><p className="text-danger font-medium">Could not start application.</p><p className="text-sm text-on-surface-variant mt-1">{error}</p></div>;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Apply: {opportunity?.title}</h1>
        <p className="text-base text-on-surface-variant">{opportunity?.departmentName || 'KICD'}</p>
      </div>
      
      {/* Stepper */}
      <div className="mb-12 flex items-center justify-between relative px-2 sm:px-8 max-w-3xl mx-auto">
        <div className="absolute left-10 right-10 sm:left-16 sm:right-16 top-5 transform -translate-y-1/2 h-1 bg-surface-container-highest z-0"></div>
        <div className="absolute left-10 sm:left-16 top-5 transform -translate-y-1/2 h-1 bg-success z-0 transition-all duration-500" style={{ width: step === 0 ? '0%' : (step === 1 ? '50%' : '100%') }}></div>
        {STEPS.map((label, i) => {
          const isActive = i === step;
          const isCompleted = i < step;

          let circleClass = "bg-white text-on-surface-variant border-outline-variant";
          if (isActive) circleClass = "bg-primary text-white border-primary";
          if (isCompleted) circleClass = "bg-success text-white border-success";

          let textClass = "text-on-surface-variant";
          if (isActive) textClass = "text-primary font-bold";
          if (isCompleted) textClass = "text-success font-semibold";

          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1 cursor-pointer" onClick={() => (isCompleted || isActive) && setStep(i)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-sm transition-colors ${circleClass}`}>
                {isCompleted ? <span className="material-symbols-outlined text-[20px]">check</span> : i + 1}
              </div>
              <span className={`text-xs ${textClass} text-center hidden sm:block whitespace-nowrap`}>{label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Form Container */}
      <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="bg-white border border-outline-variant rounded-2xl p-6 md:p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-8 border-b border-surface-container-highest pb-4 tracking-tight">{STEPS[step]}</h2>
        
        {step === 0 && (
          <div className="space-y-6">
            <p className="text-sm text-on-surface-variant mb-4">Please verify or fill in your essential profile details. This information will be saved to your profile when you submit the application.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">First name</label>
                <input required type="text" value={state.firstName} onChange={e => setState({...state, firstName: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Last name</label>
                <input required type="text" value={state.lastName} onChange={e => setState({...state, lastName: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">University</label>
                <input required type="text" value={state.university} onChange={e => setState({...state, university: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Course name</label>
                <input required type="text" value={state.courseName} onChange={e => setState({...state, courseName: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Admission Number</label>
                <input required type="text" value={state.admissionNumber} onChange={e => setState({...state, admissionNumber: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Target Department</label>
                <select required value={state.departmentId} onChange={e => setState({...state, departmentId: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant">
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Year of Study</label>
                <input required type="number" min="1" max="7" value={state.yearOfStudy} onChange={e => setState({...state, yearOfStudy: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Phone Number</label>
                <input required type="text" value={state.phoneNumber} onChange={e => setState({...state, phoneNumber: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Current GPA</label>
                <input required type="number" step="0.01" min="0" max="5" value={state.gpa} onChange={e => setState({...state, gpa: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Gender</label>
                <select required value={state.gender} onChange={e => setState({...state, gender: e.target.value})} className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant">
                  <option value="" disabled>Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Bio</label>
              <textarea required rows={3} value={state.bio} onChange={e => setState({...state, bio: e.target.value})} placeholder="Tell us a little bit about yourself..." className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface bg-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-base placeholder-outline-variant"></textarea>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Upload National ID / Student ID</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container-lowest">
                  <input type="file" id="id-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileUpload(e, 'idDocumentPath', setUploadingId)} />
                  <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                      <span className="font-bold text-primary hover:underline">Click to browse</span>
                      <span className="text-xs text-on-surface-variant mt-1">PDF, JPG, PNG (Max 5MB)</span>
                  </label>
                  <div className={`mt-4 text-sm font-bold ${uploadingId ? 'text-primary' : state.idDocumentPath ? 'text-success' : 'text-on-surface-variant'}`}>
                    {uploadingId ? 'Uploading...' : state.idDocumentPath ? 'Uploaded successfully!' : ''}
                  </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Upload Curriculum Vitae (CV)</label>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container-lowest">
                  <input type="file" id="cv-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={e => handleFileUpload(e, 'cvDocumentPath', setUploadingCv)} />
                  <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                      <span className="font-bold text-primary hover:underline">Click to browse</span>
                      <span className="text-xs text-on-surface-variant mt-1">PDF, DOCX (Max 5MB)</span>
                  </label>
                  <div className={`mt-4 text-sm font-bold ${uploadingCv ? 'text-primary' : state.cvDocumentPath ? 'text-success' : 'text-on-surface-variant'}`}>
                    {uploadingCv ? 'Uploading...' : state.cvDocumentPath ? 'Uploaded successfully!' : ''}
                  </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1 divide-y divide-surface-container-highest bg-surface-container-low rounded-xl p-6 border border-outline-variant mb-6">
              {[
                ["First name", state.firstName], 
                ["Last name", state.lastName],
                ["University", state.university], 
                ["Course", state.courseName],
                ["ID Document", state.idDocumentPath ? "Uploaded" : "Missing!"],
                ["CV Document", state.cvDocumentPath ? "Uploaded" : "Missing!"],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <span className="font-semibold text-on-surface-variant uppercase tracking-wider text-xs">{label}</span>
                  <span className={`font-medium ${value === 'Missing!' ? 'text-error' : 'text-on-surface'} text-right max-w-[60%] break-words`}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-surface-container-highest">
          <div className="flex gap-4 items-center">
            {step > 0 ? (
              <button onClick={handleBack} type="button" className="font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
              </button>
            ) : <span></span>}
            <button onClick={() => setShowCancelModal(true)} type="button" className="font-semibold text-error/80 hover:text-error transition-colors flex items-center gap-2" disabled={submitting}>
              <span className="material-symbols-outlined text-[20px]">cancel</span> Cancel
            </button>
          </div>
          
          {step < STEPS.length - 1 ? (
            <button onClick={step === 0 ? undefined : handleNext} type={step === 0 ? "submit" : "button"} className="bg-primary text-white font-semibold text-base px-6 py-3.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
              Next Step <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!state.idDocumentPath || !state.cvDocumentPath || submitting} className="bg-success text-white font-semibold text-base px-6 py-3.5 rounded-lg hover:bg-success/90 transition-colors disabled:opacity-60 shadow-sm flex items-center gap-2">
              {submitting ? "Submitting..." : "Submit Application"} <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </button>
          )}
        </div>

      </form>
      
      <ConfirmModal
        isOpen={showCancelModal}
        title="Discard Application"
        message="Are you sure you want to cancel and delete this draft application? All progress will be lost."
        confirmText="Discard Draft"
        cancelText="Keep Editing"
        confirmVariant="danger"
        onConfirm={executeCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
}
