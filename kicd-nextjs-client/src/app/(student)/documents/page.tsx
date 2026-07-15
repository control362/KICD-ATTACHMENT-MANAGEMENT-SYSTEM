"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { ApplicantProfile } from "@/types";

export default function DocumentsPage() {
  const { data: profile } = useSWR<ApplicantProfile>("/api/profile/me", fetcher);

  return (
    <div className="p-lg lg:p-xl max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary tracking-tight">My Documents</h2>
        <p className="text-lg text-on-surface-variant mt-1">Manage and view your required supporting documents.</p>
      </header>
      
      <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-lg">Document Checklist</h3>
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-transparent">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">Identification (ID)</span>
            </div>
            <span className="material-symbols-outlined text-outline text-body-md cursor-pointer hover:text-primary transition-colors">visibility</span>
          </div>
          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-transparent">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">Curriculum Vitae</span>
            </div>
            <span className="material-symbols-outlined text-outline text-body-md cursor-pointer hover:text-primary transition-colors">visibility</span>
          </div>
          {!profile?.profileCompleted ? (
            <div className="flex items-center justify-between p-md bg-error/5 border border-error/20 rounded-lg">
              <div className="flex items-center gap-md text-error">
                <span className="material-symbols-outlined">warning</span>
                <span className="font-label-md text-label-md">Profile Details</span>
              </div>
              <Link href="/profile/edit" className="bg-error text-on-error px-3 py-1.5 rounded-md text-xs font-bold uppercase hover:bg-error/90 transition-colors">Complete</Link>
            </div>
          ) : (
            <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-transparent">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-label-md text-on-surface">Application Details</span>
              </div>
              <span className="material-symbols-outlined text-outline text-body-md cursor-pointer hover:text-primary transition-colors">visibility</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
