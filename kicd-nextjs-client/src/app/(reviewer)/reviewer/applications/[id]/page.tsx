"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api, ApiError, getFileUrl } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/20 rounded-full text-xs font-bold text-success"><span className="w-2 h-2 rounded-full bg-success"></span> Approved</span>;
  if (status === "REJECTED") return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger-container border border-danger/20 rounded-full text-xs font-bold text-danger"><span className="w-2 h-2 rounded-full bg-danger"></span> Rejected</span>;
  return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning-container border border-warning/20 rounded-full text-xs font-bold text-warning"><span className="w-2 h-2 rounded-full bg-warning"></span> Pending Review</span>;
}

export default function ReviewDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function loadApp() {
      try {
        const data = await api.get(`/api/applications/${id}`);
        setApp(data);
      } catch (err: any) {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [id]);

  const decide = async (action: 'approve' | 'reject') => {
    try {
      const updatedApp = await api.put(`/api/applications/${id}/${action}`, {});
      setApp(updatedApp);
      toast.success(`Application ${action === "approve" ? "approved" : "rejected"}.`);
      setShowConfirm(false);
    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Could not save the decision.");
    }
  };

  if (loading) return <CenteredSpinner message="Loading application…" />;

  if (error || !app) {
    return (
      <div className="text-center py-16">
        <p className="text-danger font-medium">{error || "Application not found"}</p>
        <Link href="/reviewer/applications" className="text-primary font-semibold hover:underline mt-2 inline-block">Back to applications</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* Header & Back Action */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest">
        <Link href="/reviewer/applications" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium w-fit">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Applications
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-on-surface-variant">App ID: #{app.applicationId || id}</span>
          <StatusBadge status={app.status} />
        </div>
      </header>

      {/* Main Assessment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Applicant Profile */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Profile Card */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-2xl bg-primary-container text-white flex items-center justify-center text-4xl font-bold shrink-0 overflow-hidden shadow-inner border border-outline-variant">
              {app.student?.profilePhotoUrl ? (
                <img src={app.student?.profilePhotoUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                app.student?.firstName?.[0] || "?"
              )}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">{app.student?.firstName} {app.student?.lastName}</h1>
                <p className="text-base text-on-surface-variant font-medium mt-1">{app.student?.courseName || "Unknown Course"} • {app.student?.yearOfStudy ? `Year ${app.student?.yearOfStudy}` : "Unknown Year"}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  <span className="text-sm font-medium">{app.student?.university || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span className="text-sm font-medium">{app.student?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <span className="text-sm font-medium">{app.student?.phoneNumber || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span className="text-sm font-medium">Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Academic Summary & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-primary border-b border-surface-container-highest pb-3">Academic Summary</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm font-medium text-on-surface-variant">Current GPA</span>
                  <span className="text-sm font-bold text-on-surface">{app.student?.gpa ?? "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm font-medium text-on-surface-variant">Admission No</span>
                  <span className="text-sm font-bold text-on-surface">{app.student?.admissionNumber || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm font-medium text-on-surface-variant">Target Dept</span>
                  <span className="text-sm font-bold text-on-surface">{app.student?.department?.name || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-on-surface-variant">Gender</span>
                  <span className="text-sm font-bold text-on-surface">{app.student?.gender?.replace(/_/g, " ") || "—"}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-primary border-b border-surface-container-highest pb-3">Applicant Bio</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {app.student?.bio || <span className='italic opacity-70'>No bio provided.</span>}
              </p>
            </section>
          </div>

          {(app.resumeUrl || app.idDocumentUrl) && (
            <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-primary border-b border-surface-container-highest pb-3">Attached Documents</h2>
              <div className="flex flex-col gap-3">
                {app.resumeUrl && (
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[32px] text-primary">description</span>
                      <div>
                        <p className="font-bold text-sm text-on-surface">Curriculum Vitae</p>
                        <p className="text-xs text-on-surface-variant">Applicant CV</p>
                      </div>
                    </div>
                    <a href={getFileUrl(app.resumeUrl)} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary-container text-white text-sm font-bold rounded-lg hover:bg-primary transition-colors flex items-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">visibility</span> View Document
                    </a>
                  </div>
                )}
                {app.idDocumentUrl && (
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[32px] text-primary">badge</span>
                      <div>
                        <p className="font-bold text-sm text-on-surface">ID Document</p>
                        <p className="text-xs text-on-surface-variant">National / Student ID</p>
                      </div>
                    </div>
                    <a href={getFileUrl(app.idDocumentUrl)} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary-container text-white text-sm font-bold rounded-lg hover:bg-primary transition-colors flex items-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">visibility</span> View Document
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Reviewer Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-6 flex flex-col gap-4 sticky top-[88px]">
            <h2 className="text-xl font-bold text-primary border-b border-surface-container-highest pb-3">Reviewer Actions</h2>

            <div className="mt-2 text-sm">
              <p className="text-on-surface-variant font-medium uppercase tracking-wider mb-2">Current Status</p>
              <StatusBadge status={app.status} />
            </div>

            <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-surface-container-highest">
              {app.status !== 'APPROVED' && (
                <button onClick={() => decide('approve')} className="w-full bg-success text-white font-bold text-sm py-3 rounded-xl hover:bg-success/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span> Approve Application
                </button>
              )}
              {app.status !== 'REJECTED' && (
                <button onClick={() => setShowConfirm(true)} className="w-full bg-white border-2 border-danger text-danger font-bold text-sm py-3 rounded-xl hover:bg-danger-container transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">cancel</span> Reject Application
                </button>
              )}
            </div>

            {/* Status Information */}

            {app.status !== 'PENDING' && (
              <div className="mt-4 pt-4 border-t border-surface-container-highest text-sm space-y-2">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Decided by</p>
                  <p className="font-bold text-on-surface">{app.approvedBy?.email || "System/Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Decision Date</p>
                  <p className="font-bold text-on-surface">{app.approvalDate ? new Date(app.approvalDate).toLocaleString() : "—"}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Reject Application"
        message="You are about to reject this application. This action cannot be undone. Are you sure you want to proceed?"
        confirmText="Yes, Reject"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={() => decide('reject')}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
