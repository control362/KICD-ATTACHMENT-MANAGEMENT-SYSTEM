"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastContext";
import { CenteredSpinner } from "@/components/ui/Spinner";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Application } from "@/types";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const { data: applicationsData } = useSWR<Application[]>("/api/applications/me", fetcher);
  const applications = applicationsData || [];

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await api.get("/api/opportunities?status=PUBLISHED", { auth: false });
        setOpportunities(data || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const handleApply = (opportunityId: number, departmentId: number) => {
    if (user) {
      if (user.role === 'HR_OFFICER' || user.role === 'ADMIN') {
        toast.error("Staff cannot apply for opportunities.");
        return;
      }
      router.push(`/apply/${opportunityId}`);
    } else {
      sessionStorage.setItem("kicd_pending_opportunity", opportunityId.toString());
      sessionStorage.setItem("kicd_pending_department", departmentId.toString());
      router.push("/login?redirect=apply");
    }
  };

  return (
    <div className="p-lg lg:p-xl max-w-[1440px] mx-auto w-full">
      <header className="mb-xl flex justify-between items-end border-b border-border-light pb-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary tracking-tight">Current Opportunities</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Explore departments currently accepting attachment applications.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {loading && <CenteredSpinner message="Loading opportunities..." />}
        
        {!loading && error && (
          <div className="col-span-1 md:col-span-3 text-center text-red-500 py-4 font-body-md">
            Failed to load opportunities. Please try again later.
          </div>
        )}

        {!loading && !error && opportunities.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-center py-12 bg-surface rounded-xl border border-border-light shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-md">event_busy</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">No open opportunities right now</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Check back soon for new attachment placements.</p>
          </div>
        )}

        {!loading && !error && opportunities.length > 0 && opportunities.map((opp, idx) => {
          const iconColors = [
            { bg: "bg-primary-fixed", text: "text-primary", icon: "menu_book" },
            { bg: "bg-secondary-fixed", text: "text-secondary", icon: "computer" },
            { bg: "bg-tertiary-fixed", text: "text-tertiary", icon: "movie" }
          ];
          const colorTheme = iconColors[idx % 3];

          const existingApp = applications.find(a => a.opportunity?.opportunityId === opp.opportunityId);

          return (
            <div key={opp.opportunityId} className="bg-surface-default rounded-xl border border-border-light flex flex-col hover:bg-surface-container-low transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md overflow-hidden">
              <div className="relative w-full h-48">
                <img src={opp.imageUrl ? (opp.imageUrl.startsWith("http") || opp.imageUrl.startsWith("/kicd_") ? opp.imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}${opp.imageUrl}`) : "/kicd_professional_growth.png"} alt={opp.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 px-sm py-xs bg-surface/90 text-success rounded-full font-label-sm text-label-sm shadow-sm backdrop-blur-md">
                  {opp.numberOfSlots} Positions
                </div>
              </div>
              <div className="p-md flex flex-col flex-grow">
                <span className="text-xs font-bold uppercase tracking-wider mb-2 text-on-surface-variant">{opp.departmentName || 'KICD'}</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{opp.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg flex-grow line-clamp-3">{opp.description}</p>
              <div className="flex justify-between items-center pt-md border-t border-border-light gap-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs flex-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> Closes: {new Date(opp.applicationDeadline).toLocaleDateString()}
                </span>
                
                <div className="shrink-0 flex items-center">
                  {!existingApp ? (
                    <button onClick={() => handleApply(opp.opportunityId, opp.departmentId)} className="px-md py-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap">
                      Apply Now
                    </button>
                  ) : existingApp.status === 'DRAFT' ? (
                    <Link href={`/apply/${opp.opportunityId}`} className="px-md py-sm rounded-lg bg-outline text-surface font-label-md text-label-md hover:opacity-90 transition-opacity whitespace-nowrap">
                      Continue Draft
                    </Link>
                  ) : (
                    <Link href={`/applications/${existingApp.applicationId}`} className="px-md py-sm rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                      Applied
                    </Link>
                  )}
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
