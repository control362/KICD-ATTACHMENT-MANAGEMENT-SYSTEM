"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { ApplicantProfile } from "@/types";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";

export default function DocumentsPage() {
  const { data: profile, mutate } = useSWR<ApplicantProfile>("/api/profile/me", fetcher);
  const toast = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idDocumentUrl' | 'resumeUrl') => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(field);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload the file to the document storage endpoint
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
      const newFileUrl = data.fileUrl;

      // 2. Update the profile with the new document URL
      const profileDto = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        university: profile.university,
        courseName: profile.courseName,
        admissionNumber: profile.admissionNumber,
        departmentId: profile.department?.departmentId,
        profilePhotoUrl: profile.profilePhotoUrl,
        gpa: profile.gpa,
        gender: profile.gender,
        bio: profile.bio,
        yearOfStudy: profile.yearOfStudy,
        phoneNumber: profile.phoneNumber,
        idDocumentUrl: field === 'idDocumentUrl' ? newFileUrl : profile.idDocumentUrl,
        resumeUrl: field === 'resumeUrl' ? newFileUrl : profile.resumeUrl,
      };

      await api.put(`/api/profile/${profile.studentId}`, profileDto);
      
      // Re-fetch the profile to reflect changes
      await mutate();
      toast.success("Document uploaded successfully.");

    } catch (err: any) {
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploading(null);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = "";
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  if (!profile) return <CenteredSpinner message="Loading documents..." />;

  const isComplete = profile.firstName && profile.lastName && profile.admissionNumber && profile.department && profile.university && profile.courseName && profile.yearOfStudy && profile.phoneNumber && profile.gpa && profile.gender && profile.bio;

  return (
    <div className="p-lg lg:p-xl max-w-[1440px] mx-auto w-full">
      <header className="mb-xl flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary tracking-tight">My Documents</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage and view your required supporting documents.</p>
        </div>
      </header>
      
      <div className="bg-surface-default border border-border-light rounded-xl p-lg shadow-sm max-w-[900px]">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-lg">Document Checklist</h3>
        
        <div className="flex flex-col gap-md">
          {/* Identification Document Row */}
          <DocumentRow 
            title="Identification (ID)"
            fileUrl={profile.idDocumentUrl}
            isUploading={uploading === 'idDocumentUrl'}
            onUpload={(e) => handleFileUpload(e, 'idDocumentUrl')}
            accept=".pdf,.jpg,.jpeg,.png"
            id="id-upload"
            getFullUrl={getFullUrl}
          />
          
          {/* Resume / CV Row */}
          <DocumentRow 
            title="Curriculum Vitae (CV)"
            fileUrl={profile.resumeUrl}
            isUploading={uploading === 'resumeUrl'}
            onUpload={(e) => handleFileUpload(e, 'resumeUrl')}
            accept=".pdf,.doc,.docx"
            id="cv-upload"
            getFullUrl={getFullUrl}
          />

          {/* Profile Details Row */}
          {!isComplete ? (
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
                <span className="font-label-md text-label-md text-on-surface">Profile Details</span>
              </div>
              <Link href="/profile/edit" className="font-label-sm text-label-sm text-primary hover:underline transition-colors uppercase">Edit</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ title, fileUrl, isUploading, onUpload, accept, id, getFullUrl }: { title: string, fileUrl?: string, isUploading: boolean, onUpload: (e: any) => void, accept: string, id: string, getFullUrl: (url: string) => string }) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-md rounded-lg border ${!fileUrl ? 'bg-error/5 border-error/20' : 'bg-surface-container-low border-transparent'} gap-md sm:gap-0`}>
      <div className={`flex items-center gap-md ${!fileUrl ? 'text-error' : 'text-success'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: fileUrl ? "'FILL' 1" : "'FILL' 0" }}>
          {fileUrl ? 'check_circle' : 'warning'}
        </span>
        <span className="font-label-md text-label-md text-on-surface">{title}</span>
      </div>
      
      <div className="flex items-center gap-md w-full sm:w-auto justify-end">
        {isUploading ? (
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Uploading...
          </span>
        ) : (
          <>
            {fileUrl && (
              <a href={getFullUrl(fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" title="View Document">
                <span className="material-symbols-outlined text-[20px]">visibility</span> View
              </a>
            )}
            
            <div>
              <input type="file" id={id} className="hidden" accept={accept} onChange={onUpload} />
              <label htmlFor={id} className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${fileUrl ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest' : 'bg-error text-on-error hover:bg-error/90'}`}>
                {fileUrl ? 'Replace' : 'Upload'}
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
