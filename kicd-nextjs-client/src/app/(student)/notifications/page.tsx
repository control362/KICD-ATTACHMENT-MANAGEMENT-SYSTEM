"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Application } from "@/types";
import { CenteredSpinner } from "@/components/ui/Spinner";

export default function NotificationsPage() {
  const { data: applicationsData, isLoading } = useSWR<Application[]>("/api/applications/me", fetcher);
  const applications = applicationsData || [];
  const notifications = applications.filter(app => app.status === 'APPROVED' || app.status === 'REJECTED');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (notifications.length > 0) {
      // Mark all current notification IDs as read in localStorage
      const readIds = notifications.map(n => n.applicationId);
      localStorage.setItem('readNotificationIds', JSON.stringify(readIds));
      
      // Dispatch a custom event so the sidebar can update its badge immediately
      window.dispatchEvent(new Event('notificationsRead'));
    }
  }, [notifications.length]); // only run when notifications array changes length

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading || !mounted) {
    return <CenteredSpinner message="Loading notifications…" />;
  }

  return (
    <div className="p-lg lg:p-xl max-w-[1440px] mx-auto w-full">
      <header className="mb-xl flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary tracking-tight">Notifications</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Stay updated on your application status.</p>
        </div>
      </header>
      
      <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm">
        <div className="flex flex-col gap-md">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-outline mb-4">notifications_off</span>
              <p className="text-on-surface-variant">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map(app => (
              <div key={app.applicationId} className={`p-6 rounded-lg border flex gap-4 items-start ${
                app.status === 'APPROVED' ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'
              }`}>
                <span className={`material-symbols-outlined shrink-0 mt-0.5 text-2xl ${
                  app.status === 'APPROVED' ? 'text-success' : 'text-danger'
                }`}>
                  {app.status === 'APPROVED' ? 'celebration' : 'error'}
                </span>
                <div>
                  <h4 className={`font-bold text-lg mb-2 ${app.status === 'APPROVED' ? 'text-success' : 'text-danger'}`}>
                    {app.status === 'APPROVED' ? 'Application Approved!' : 'Application Not Approved'}
                  </h4>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {app.status === 'APPROVED' 
                      ? `Congratulations! Your application for "${app.opportunity?.title}" was successful. KICD will contact you soon with next steps.`
                      : `Your application for "${app.opportunity?.title}" was not approved this cycle. Browse other opportunities to apply again.`
                    }
                  </p>
                  <p className="text-xs text-outline font-medium">{formatDate(app.updatedAt || app.approvalDate || app.submittedAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
