"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Application } from "@/types";

export default function ApplicationsList() {
  const { user } = useAuth();
  const toast = useToast();
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);

  const { data: applicationsData, isLoading, mutate } = useSWR<Application[]>("/api/applications/me", fetcher);
  const applications = applicationsData || [];

  if (isLoading || !user) {
    return <CenteredSpinner message="Loading your applications…" />;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const executeCancelApplication = async () => {
    if (!deleteAppId) return;
    try {
      await api.delete(`/api/applications/${deleteAppId}`);
      await mutate();
      toast.success("Application successfully deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel application");
    } finally {
      setDeleteAppId(null);
    }
  };

  return (
    <div className="p-lg lg:p-xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">My Applications</h2>
        <p className="text-lg text-on-surface-variant mt-1">Track the status of all your submitted and draft applications.</p>
      </header>

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
                <tr><td colSpan={4} className="px-lg py-12 text-center text-on-surface-variant">You have not started or submitted any applications yet.</td></tr>
              ) : applications.map(app => (
                <tr key={app.applicationId} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-lg py-md">
                    <p className="font-label-md text-label-md text-primary">{app.opportunity?.title || 'Application'}</p>
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
                      <Link href={app.status === 'DRAFT' ? `/apply/${app.opportunity?.opportunityId}` : `/applications/${app.applicationId}`} className="text-primary hover:underline text-label-sm flex items-center gap-xs">
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
