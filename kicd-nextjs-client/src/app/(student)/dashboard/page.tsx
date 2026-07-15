"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ApplicantProfile, Application, Opportunity } from "@/types";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);

  const heroImages = ["/hero-img.png", "/hero-img-2.png", "/hero-img-3.png"];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="p-lg lg:p-xl pb-0 shrink-0">
        <section className="relative w-full h-[350px] md:h-[450px] flex items-center justify-center overflow-hidden rounded-3xl shadow-md">
          <div className="absolute inset-0 z-0 bg-black">
            {heroImages.map((src, idx) => (
              <img 
                key={src}
                alt={`KICD Reception Area ${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`} 
                src={src} 
              />
            ))}
            <div className="absolute inset-0 hero-gradient"></div>
          </div>
          <div className="relative z-10 text-center px-gutter flex flex-col items-center gap-md lg:gap-lg" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
            <span className="px-md py-xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">Industrial Attachment Portal</span>
            <h1 className="font-display-md lg:font-display-lg text-display-md lg:text-display-lg text-on-primary mb-xs lg:mb-sm" style={{ width: "100%" }}>Nurturing Every Learner's Potential</h1>
            <p className="font-body-md lg:font-body-lg text-body-md lg:text-body-lg text-primary-fixed mb-lg lg:mb-xl" style={{ width: "100%", maxWidth: "700px" }}>
              Join the Kenya Institute of Curriculum Development for hands-on experience in shaping the future of education. Apply now for our comprehensive attachment program.
            </p>
            <div className="flex flex-col sm:flex-row gap-md" style={{ width: "100%", justifyContent: "center" }}>
              <button onClick={() => document.getElementById('opportunities')?.scrollIntoView({behavior: 'smooth'})} className="px-xl py-md rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 flex items-center justify-center gap-xs">
                <span>Proceed with Applications</span>
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </button>
              <Link href="/applications" className="px-xl py-md rounded-lg font-label-md text-label-md border-2 border-on-primary text-on-primary hover:bg-on-primary hover:text-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 text-center">
                View My Applications
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Main Dashboard Content */}
      <div id="opportunities" className="p-lg lg:p-xl shrink-0">
        {/* Removed Quick Stats as requested */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
          {/* Main Content (Left/Center) */}
          <div className="xl:col-span-2 flex flex-col gap-xl">
            {/* Active Opportunities */}
            <div>
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-headline-md text-headline-md text-primary">Active Opportunities</h3>
                <Link href="/opportunities" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {opportunities.length === 0 ? (
                  <div className="col-span-2 text-center text-on-surface-variant py-8 border border-dashed rounded-xl">No active opportunities at the moment.</div>
                ) : opportunities.slice(0, 4).map(opp => {
                  const existingApp = applications.find(a => a.opportunity?.opportunityId === opp.opportunityId);
                  return (
                    <div key={opp.opportunityId} className="bg-surface-default border border-border-light rounded-xl hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                      <div className="relative w-full h-32">
                        <img src={opp.imageUrl ? (opp.imageUrl.startsWith("http") || opp.imageUrl.startsWith("/kicd_") ? opp.imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}${opp.imageUrl}`) : "/kicd_professional_growth.png"} alt={opp.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-surface/90 text-on-surface-variant text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm backdrop-blur-md">
                          {opp.numberOfSlots} Slots
                        </div>
                      </div>
                      <div className="p-md flex flex-col flex-grow">
                        <h4 className="font-headline-sm text-headline-sm text-primary mb-1">{opp.title}</h4>
                        <p className="text-body-sm text-on-surface-variant mb-lg flex-1">{opp.department?.name || 'KICD'} • {opp.duration || 'N/A'}</p>
                      <div className="flex gap-sm mt-auto">
                        {!existingApp ? (
                          <Link href={`/apply/${opp.opportunityId}`} className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">Apply Now</Link>
                        ) : existingApp.status === 'DRAFT' ? (
                          <Link href={`/apply/${opp.opportunityId}`} className="flex-1 bg-outline text-surface py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">Continue Draft</Link>
                        ) : (
                          <Link href={`/applications/${existingApp.applicationId}`} className="flex-1 bg-surface-container-high text-on-surface py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity text-center flex items-center justify-center">View Application</Link>
                        )}
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Applications moved to dedicated page */}
          </div>

          {/* Sidebar / Secondary Content */}
          <div className="flex flex-col gap-xl">
            {/* Removed Notifications and Documents as requested */}

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
