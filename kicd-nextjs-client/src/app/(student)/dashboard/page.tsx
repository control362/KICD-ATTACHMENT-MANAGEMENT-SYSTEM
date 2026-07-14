"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ApplicantProfile, Application, Opportunity } from "@/types";

export default function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);

  const { data: profile, isLoading: loadingProfile } = useSWR<ApplicantProfile>("/api/profile/me", fetcher);
  const { data: applicationsData, isLoading: loadingApps, mutate: mutateApps } = useSWR<Application[]>("/api/applications/me", fetcher);
  const { data: opportunitiesData, isLoading: loadingOpps } = useSWR<Opportunity[]>("/api/opportunities?status=PUBLISHED", fetcher);

  const applications = applicationsData || [];
  const opportunities = opportunitiesData || [];
  const loading = loadingProfile || loadingApps || loadingOpps;

  if (loading || !user) {
    return <CenteredSpinner message="Loading your dashboard…" />;
  }

  // Calculate Stats
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'PENDING').length;
  const approvedApps = applications.filter(a => a.status === 'APPROVED').length;
  const drafts = applications.filter(a => a.status === 'DRAFT').length;

  let profileProgress = 0;
  if (profile) {
    const requiredFields = [
      profile.firstName,
      profile.lastName,
      profile.admissionNumber,
      profile.department?.departmentId,
      profile.university,
      profile.courseName,
      profile.yearOfStudy,
      profile.phoneNumber,
      profile.gpa,
      profile.gender,
      profile.bio
    ];
    const filledCount = requiredFields.filter(f => f !== null && f !== undefined && String(f).trim() !== "").length;
    profileProgress = Math.round((filledCount / requiredFields.length) * 100);
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const executeCancelApplication = async () => {
    if (!deleteAppId) return;
    try {
      await api.delete(`/api/applications/${deleteAppId}`);
      await mutateApps();
      toast.success("Application successfully deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel application");
    } finally {
      setDeleteAppId(null);
    }
  };

  return (
    <div className="flex w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col w-64 p-md sticky top-[72px] bg-surface-container-lowest border-r border-border-light h-[calc(100vh-72px)] overflow-y-auto">
        <div className="mb-xl px-sm">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-wider">Navigation</h2>
        </div>
        <nav className="flex flex-col gap-xs">
          <Link className="flex items-center gap-md p-md bg-primary-container text-on-primary-container font-bold rounded-lg transition-all duration-150" href="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-150" href="/application/status">
            <span className="material-symbols-outlined">description</span>
            <span className="font-label-md text-label-md">Applications</span>
          </Link>
          <div className="my-md border-t border-border-light"></div>
          <Link className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-150" href="/profile">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </nav>
        <div className="mt-auto p-md glass-card rounded-xl border border-secondary-container/20">
          <div className="flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            <p className="font-label-sm text-label-sm text-secondary font-bold">Verification Status</p>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-md">Keep your profile fully updated for better opportunities.</p>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <section className="flex-1 p-lg lg:p-xl overflow-y-auto">
        {/* Welcome Hero & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
          <div className="lg:col-span-2 bg-primary text-on-primary rounded-xl p-xl relative overflow-hidden flex flex-col justify-center shadow-sm">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-on-primary opacity-5 rounded-full blur-3xl"></div>
            <h2 className="font-headline-lg text-headline-lg mb-xs z-10">Welcome back, {user.email.split('@')[0]}!</h2>
            <div className="flex items-center gap-md text-on-primary-container text-body-sm opacity-90 z-10">
              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-body-md">fingerprint</span> Applicant ID: {user.userId}</span>
            </div>
          </div>
          <div className="bg-surface-default border border-border-light rounded-xl p-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-sm">
                <h3 className="font-label-md text-label-md text-primary">Profile Completion</h3>
                <span className="font-bold text-primary">{profileProgress}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full shadow-[0_0_8px_rgba(253,183,71,0.5)]" style={{ width: `${profileProgress}%` }}></div>
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-sm">{profileProgress === 100 ? 'Your profile is fully complete!' : 'Update your profile section to reach 100%.'}</p>
            <Link href="/profile/edit" className="mt-md flex items-center justify-center gap-sm w-full py-2 border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-surface-subtle transition-all">
              Complete Profile <span className="material-symbols-outlined text-body-md">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
          <div className="bg-surface-default border border-border-light p-lg rounded-xl flex items-center gap-lg shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-headline-sm">list_alt</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant font-medium">Total Apps</p>
              <p className="text-headline-sm font-bold text-primary">{totalApps < 10 ? `0${totalApps}` : totalApps}</p>
            </div>
          </div>
          <div className="bg-surface-default border border-border-light p-lg rounded-xl flex items-center gap-lg shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-headline-sm">pending_actions</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant font-medium">Pending</p>
              <p className="text-headline-sm font-bold text-primary">{pendingApps < 10 ? `0${pendingApps}` : pendingApps}</p>
            </div>
          </div>
          <div className="bg-surface-default border border-border-light p-lg rounded-xl flex items-center gap-lg shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-surface-container-low flex items-center justify-center text-success">
              <span className="material-symbols-outlined text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant font-medium">Approved</p>
              <p className="text-headline-sm font-bold text-primary">{approvedApps < 10 ? `0${approvedApps}` : approvedApps}</p>
            </div>
          </div>
          <div className="bg-surface-default border border-border-light p-lg rounded-xl flex items-center gap-lg shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-headline-sm">edit_note</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant font-medium">Drafts</p>
              <p className="text-headline-sm font-bold text-primary">{drafts < 10 ? `0${drafts}` : drafts}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
          {/* Main Content (Left/Center) */}
          <div className="xl:col-span-2 flex flex-col gap-xl">
            {/* Active Opportunities */}
            <div>
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-md text-headline-md text-primary">Active Opportunities</h3>
                <Link href="/" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {opportunities.length === 0 ? (
                  <div className="col-span-2 text-center text-on-surface-variant py-8 border border-dashed rounded-xl">No active opportunities at the moment.</div>
                ) : opportunities.slice(0, 4).map(opp => {
                  const existingApp = applications.find(a => a.opportunity?.opportunityId === opp.opportunityId);
                  return (
                    <div key={opp.opportunityId} className="bg-surface-default border border-border-light p-lg rounded-xl hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-md">
                        <div className="h-10 w-10 bg-primary-fixed rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">work</span>
                        </div>
                        <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full">{opp.numberOfSlots} Open Positions</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-primary mb-1">{opp.title}</h4>
                      <p className="text-body-sm text-on-surface-variant mb-lg flex-1">{opp.department?.name || 'KICD'} • {opp.duration || 'N/A'}</p>
                      <div className="flex gap-sm mt-auto">
                        {!existingApp ? (
                          <Link href={`/apply/${opp.opportunityId}`} className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">Apply Now</Link>
                        ) : existingApp.status === 'DRAFT' ? (
                          <Link href={`/apply/${opp.opportunityId}`} className="flex-1 bg-outline text-surface py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">Continue Draft</Link>
                        ) : (
                          <Link href="/application/status" className="flex-1 bg-surface-container-high text-on-surface py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">View Application</Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Applications */}
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-lg">My Applications</h3>
              <div className="bg-surface-default border border-border-light rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low border-b border-border-light">
                      <tr>
                        <th className="px-lg py-md font-label-md text-label-md text-primary">Position Title</th>
                        <th className="px-lg py-md font-label-md text-label-md text-primary">Date Submitted</th>
                        <th className="px-lg py-md font-label-md text-label-md text-primary">Status</th>
                        <th className="px-lg py-md font-label-md text-label-md text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {applications.length === 0 ? (
                        <tr><td colSpan={4} className="px-lg py-8 text-center text-on-surface-variant">You have not submitted any applications yet.</td></tr>
                      ) : applications.map(app => (
                        <tr key={app.applicationId} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-lg py-md">
                            <p className="font-label-md text-label-md text-primary">{app.opportunity?.title || 'Application'}</p>
                            <p className="text-body-sm text-on-surface-variant">Ref: #APP-{app.applicationId}</p>
                          </td>
                          <td className="px-lg py-md text-body-sm text-on-surface-variant">{formatDate(app.submittedAt) || 'Draft'}</td>
                          <td className="px-lg py-md">
                            {app.status === 'APPROVED' && <span className="px-3 py-1 bg-success/10 text-success text-label-sm font-bold rounded-full">Approved</span>}
                            {app.status === 'REJECTED' && <span className="px-3 py-1 bg-error/10 text-error text-label-sm font-bold rounded-full">Rejected</span>}
                            {app.status === 'DRAFT' && <span className="px-3 py-1 bg-surface-container-high text-on-surface text-label-sm font-bold rounded-full">Draft</span>}
                            {app.status === 'PENDING' && <span className="px-3 py-1 bg-secondary-fixed/30 text-secondary-fixed-dim text-label-sm font-bold rounded-full" style={{ color: "#624000", backgroundColor: "rgba(255, 185, 76, 0.2)" }}>Under Review</span>}
                          </td>
                          <td className="px-lg py-md">
                            <div className="flex gap-md items-center">
                              <Link href={app.status === 'DRAFT' ? `/apply/${app.opportunity?.opportunityId}` : '/application/status'} className="text-primary hover:underline text-label-sm flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[18px]">{app.status === 'DRAFT' ? 'edit' : 'visibility'}</span> {app.status === 'DRAFT' ? 'Continue' : 'View'}
                              </Link>
                              {app.status === 'DRAFT' && (
                                <button onClick={() => setDeleteAppId(app.applicationId)} className="text-error hover:underline text-label-sm flex items-center gap-xs">
                                  <span className="material-symbols-outlined text-[18px]">cancel</span> Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Secondary Content */}
          <div className="flex flex-col gap-xl">
            {/* Notification Center */}
            <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-sm text-headline-sm text-primary">Notifications</h3>
                <span className="h-5 w-5 bg-surface-container-high text-on-surface-variant flex items-center justify-center rounded-full text-[10px] font-bold">
                  {applications.filter(app => app.status === 'APPROVED' || app.status === 'REJECTED').length}
                </span>
              </div>
              <div className="flex flex-col gap-md">
                {applications.filter(app => app.status === 'APPROVED' || app.status === 'REJECTED').length === 0 ? (
                  <p className="text-center text-sm text-on-surface-variant py-4 opacity-70">No new notifications</p>
                ) : (
                  applications.filter(app => app.status === 'APPROVED' || app.status === 'REJECTED').map(app => (
                    <div key={app.applicationId} className={`p-4 rounded-lg border flex gap-3 items-start ${
                      app.status === 'APPROVED' ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'
                    }`}>
                      <span className={`material-symbols-outlined shrink-0 mt-0.5 ${
                        app.status === 'APPROVED' ? 'text-success' : 'text-danger'
                      }`}>
                        {app.status === 'APPROVED' ? 'celebration' : 'error'}
                      </span>
                      <div>
                        <h4 className={`font-bold text-sm mb-1 ${app.status === 'APPROVED' ? 'text-success' : 'text-danger'}`}>
                          {app.status === 'APPROVED' ? 'Application Approved!' : 'Application Not Approved'}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {app.status === 'APPROVED' 
                            ? `Congratulations! Your application for "${app.opportunity?.title}" was successful. KICD will contact you soon with next steps.`
                            : `Your application for "${app.opportunity?.title}" was not approved this cycle. Browse other opportunities to apply again.`
                          }
                        </p>
                        <p className="text-[10px] text-outline mt-2">{formatDate(app.updatedAt || app.approvalDate || app.submittedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-lg">Document Checklist</h3>
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-label-md text-label-md text-on-surface">Identification (ID)</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-body-md">visibility</span>
                </div>
                <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-label-md text-label-md text-on-surface">Curriculum Vitae</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-body-md">visibility</span>
                </div>
                {!profile?.profileCompleted ? (
                  <div className="flex items-center justify-between p-md bg-error/5 border border-error/20 rounded-lg">
                    <div className="flex items-center gap-md text-error">
                      <span className="material-symbols-outlined">warning</span>
                      <span className="font-label-md text-label-md">Profile Details</span>
                    </div>
                    <Link href="/profile/edit" className="bg-error text-on-error px-2 py-1 rounded text-[10px] font-bold uppercase">Complete</Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-label-md text-label-md text-on-surface">Application Details</span>
                    </div>
                    <span className="material-symbols-outlined text-outline text-body-md">visibility</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-md">
              <Link href="/profile/edit" className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl font-label-md flex items-center justify-center gap-md hover:bg-surface-container-highest transition-all">
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </Link>
              <Link href="/" className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-md shadow-lg hover:-translate-y-1 transition-all duration-200">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                Find Attachment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={!!deleteAppId}
        title="Delete Draft Application"
        message="Are you sure you want to cancel and delete this draft application? This action cannot be undone."
        confirmText="Delete Draft"
        cancelText="Keep Draft"
        confirmVariant="danger"
        onConfirm={executeCancelApplication}
        onCancel={() => setDeleteAppId(null)}
      />
    </div>
  );
}
