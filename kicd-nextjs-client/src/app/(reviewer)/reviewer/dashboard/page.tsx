"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { API_BASE_URL } from "@/lib/config";

function MetricCard({ title, value, icon, iconBg, iconColor, badge, badgeColor, href }: any) {
  return (
    <Link href={href} className="block bg-white rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm border border-outline-variant/30`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        {badge && <span className={`${badgeColor} px-3 py-1 rounded-full text-xs font-bold shadow-sm`}>{badge}</span>}
      </div>
      <div className="z-10 relative">
        <h3 className="text-4xl font-black text-primary tracking-tight">{value}</h3>
        <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mt-2">{title}</p>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/20 rounded-full text-xs font-bold text-success"><span className="w-2 h-2 rounded-full bg-success"></span> Approved</span>;
  } else if (status === "REJECTED") {
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger-container border border-danger/20 rounded-full text-xs font-bold text-danger"><span className="w-2 h-2 rounded-full bg-danger"></span> Rejected</span>;
  } else {
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning-container border border-warning/20 rounded-full text-xs font-bold text-warning"><span className="w-2 h-2 rounded-full bg-warning"></span> Pending</span>;
  }
}

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [appsRes, deptsRes] = await Promise.all([
          api.get("/api/applications"),
          api.get("/api/departments"),
        ]);
        setApplications(appsRes || []);
        setDepartments(deptsRes || []);
      } catch (err: any) {
        setError(err.message || "Could not load the dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !user) return <CenteredSpinner message="Loading dashboard…" />;
  
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-danger font-medium">Could not load the dashboard.</p>
        <p className="text-sm text-on-surface-variant mt-1">{error}</p>
      </div>
    );
  }

  const counts = {
    total: applications.length,
    PENDING: applications.filter(a => a.status === "PENDING").length,
    APPROVED: applications.filter(a => a.status === "APPROVED").length,
    REJECTED: applications.filter(a => a.status === "REJECTED").length,
  };

  const recent = [...applications]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8);

  const byDept = departments.map(d => ({
    name: d.name,
    count: applications.filter(a => a.student?.department?.departmentId === d.departmentId).length,
  }));
  
  const maxDept = Math.max(1, ...byDept.map(d => d.count));
  const userName = user?.firstName || user?.email?.split('@')[0] || 'Reviewer';

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Reviewer Dashboard</h2>
          <p className="text-lg text-on-surface-variant mt-1">Welcome back, {userName}. Here is your overview.</p>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Applications" value={counts.total} icon="description" iconBg="bg-primary-container" iconColor="text-white" href="/reviewer/applications?tab=all" />
        <MetricCard title="Pending Reviews" value={counts.PENDING} icon="pending_actions" iconBg="bg-warning-container" iconColor="text-warning" badge="Action Needed" badgeColor="bg-warning text-white" href="/reviewer/applications?tab=pending" />
        <MetricCard title="Approved" value={counts.APPROVED} icon="how_to_reg" iconBg="bg-success/20" iconColor="text-success" href="/reviewer/applications?tab=approved" />
        <MetricCard title="Rejected" value={counts.REJECTED} icon="block" iconBg="bg-danger-container" iconColor="text-danger" href="/reviewer/applications?tab=rejected" />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions Table */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-white">
            <h3 className="text-xl font-bold text-primary tracking-tight">Recent Submissions</h3>
            <Link href="/reviewer/applications" className="text-primary font-semibold text-sm hover:text-primary-container transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6 w-1/3">Applicant</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface">
                {recent.length === 0 ? (
                  <tr><td className="px-6 py-10 text-center text-on-surface-variant font-medium" colSpan={4}>No applications yet.</td></tr>
                ) : recent.map(a => (
                  <tr key={a.applicationId} onClick={() => router.push(`/reviewer/applications/${a.applicationId}`)} className="border-b border-surface-container-lowest hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0 shadow-sm border border-outline-variant">
                          {a.student?.firstName?.charAt(0) || ''}{a.student?.lastName?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-base">{a.student?.firstName} {a.student?.lastName}</p>
                          <p className="text-on-surface-variant text-xs mt-0.5">{new Date(a.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-medium">{a.student?.department?.name || "—"}</td>
                    <td className="py-4 px-6"><StatusBadge status={a.status} /></td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-primary font-semibold hover:text-primary-container transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        Review <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Volume by Department */}
        <aside className="bg-white rounded-2xl border border-outline-variant shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-surface-container-highest bg-white">
            <h3 className="text-xl font-bold text-primary tracking-tight">Volume by Department</h3>
            <p className="text-sm text-on-surface-variant mt-1">Application distribution</p>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto bg-surface-container-lowest">
            {byDept.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4 font-medium">No departments yet.</p>
            ) : byDept.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-on-surface-variant">{d.name}</span>
                  <span className="font-bold text-primary">{d.count}</span>
                </div>
                <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(d.count / maxDept) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
