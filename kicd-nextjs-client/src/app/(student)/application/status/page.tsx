"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";

export default function ApplicationStatus() {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await api.get("/api/applications/me");
        setApp(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  if (loading) return <CenteredSpinner message="Loading your status…" />;

  if (error || !app || (Array.isArray(app) && app.length === 0)) {
    return (
      <div className="text-center py-16">
        <p className="text-on-surface font-medium">{error || "No applications found."}</p>
        <Link href="/dashboard" className="text-primary font-semibold hover:underline mt-2 inline-block">Back to dashboard</Link>
      </div>
    );
  }

  const applications = Array.isArray(app) ? app : [app];

  const stages = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "REVIEW", label: "Under review" },
    { key: "DECISION", label: "Decision" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">Application Timeline</h1>
        <p className="text-on-surface-variant">View the detailed history and status of your applications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {applications.map((currentApp: any, idx: number) => {
          const currentIndex = currentApp.status === "PENDING" ? 1 : (currentApp.status === "DRAFT" ? 0 : 2);
          
          return (
            <div key={currentApp.applicationId || idx} className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-primary mb-2">{currentApp.opportunity?.title || "Application"}</h2>
            <p className="text-sm text-on-surface-variant mb-4">Department: {currentApp.opportunity?.departmentName || "KICD"} • Ref: #APP-{currentApp.applicationId}</p>
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm mb-6 flex-1">
              <h3 className="text-xl font-bold text-primary mb-8 pb-4 border-b border-surface-container-highest tracking-tight">Application History</h3>
              
              <div className="relative pl-3">
                {/* Continuous vertical line */}
                <div className="absolute left-[23px] top-4 bottom-8 w-[2px] bg-surface-container-highest z-0"></div>
                
                <div className="space-y-10">
                  {[...stages].reverse().map((stage, reverseIdx) => {
                    const index = 2 - reverseIdx;
                    const isDone = index < currentIndex || (index === currentIndex && currentApp.status !== "PENDING" && currentApp.status !== "DRAFT");
                    const isCurrent = index === currentIndex && (currentApp.status === "PENDING" || currentApp.status === "DRAFT");
                    
                    let iconHtml;
                    let titleColor = "text-on-surface";
                    
                    if (currentApp.status === "REJECTED" && index === 2) {
                      iconHtml = <div className="w-7 h-7 rounded-full bg-danger text-white flex items-center justify-center z-10 shrink-0"><span className="material-symbols-outlined text-[16px]">close</span></div>;
                      titleColor = "text-danger";
                    } else if (currentApp.status === "APPROVED" && index === 2) {
                      iconHtml = <div className="w-7 h-7 rounded-full bg-success text-white flex items-center justify-center z-10 shrink-0"><span className="material-symbols-outlined text-[16px]">check</span></div>;
                      titleColor = "text-success";
                    } else if (isDone) {
                      iconHtml = <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center z-10 shrink-0"><span className="material-symbols-outlined text-text-secondary text-[14px]">check</span></div>;
                    } else if (isCurrent) {
                      iconHtml = <div className="w-7 h-7 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-primary"></div></div>;
                      titleColor = "text-primary";
                    } else {
                      iconHtml = <div className="w-7 h-7 rounded-full bg-white border-2 border-outline-variant flex items-center justify-center z-10 shrink-0"></div>;
                      titleColor = "text-outline-variant";
                    }

                    const description = index === 2 && currentApp.status !== "PENDING" && currentApp.status !== "DRAFT"
                      ? `${currentApp.status === "APPROVED" ? "Approved" : "Rejected"}${currentApp.approvalDate ? " on " + new Date(currentApp.approvalDate).toLocaleDateString() : ""}`
                      : index === 2 ? "Awaiting a decision" : index === 0 ? "Received by KICD" : "A reviewer is evaluating your application";

                    return (
                      <div key={stage.key} className="flex gap-6 relative">
                        {iconHtml}
                        <div className="pb-2">
                          <p className={`font-bold text-base ${titleColor} mb-1`}>{stage.label}</p>
                          <p className="text-sm text-on-surface-variant">{description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {currentApp.status === "APPROVED" && (
              <div className="mt-8 bg-success/10 border border-success/30 text-success-fixed-dim rounded-xl p-6 shadow-sm">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[24px] text-success shrink-0">celebration</span>
                  <div>
                    <h4 className="font-bold text-success mb-2 text-lg">Application Successful!</h4>
                    <p className="text-sm text-on-surface-variant">Congratulations! Your application has been approved. The KICD team will be in touch with you shortly via email with further communications regarding your onboarding, next steps, and what you will be doing during your attachment. Please ensure your contact details are up to date in your profile.</p>
                  </div>
                </div>
              </div>
            )}

            {currentApp.status === "REJECTED" && (
              <div className="mt-8 bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 shadow-sm">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[24px] shrink-0">error</span>
                  <div>
                    <h4 className="font-bold mb-1">Application not approved</h4>
                    <p className="text-sm text-on-surface-variant">We regret to inform you that your application was not approved for this cycle. The position may have been filled or your qualifications did not match our current requirements. <Link href="/opportunities" className="underline font-semibold hover:text-danger/80">Browse other opportunities</Link> to apply again.</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentApp.status === "DRAFT" && (
              <div className="mt-8 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl p-6 shadow-sm">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[24px] shrink-0">edit_document</span>
                  <div>
                    <h4 className="font-bold mb-1">Application is in Draft</h4>
                    <p className="text-sm text-on-surface-variant">You have not submitted this application yet. <Link href={`/apply/${currentApp.opportunity?.opportunityId}`} className="text-primary underline font-semibold hover:text-primary-fixed">Click here</Link> to resume and submit your application.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
