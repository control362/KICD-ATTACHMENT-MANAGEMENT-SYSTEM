"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";

const TABS = [
  { key: "all", label: "All", endpoint: "/api/applications" },
  { key: "pending", label: "Pending", endpoint: "/api/applications/pending" },
  { key: "approved", label: "Approved", endpoint: "/api/applications/approved" },
  { key: "rejected", label: "Rejected", endpoint: "/api/applications/rejected" },
];

const EMPTY_COPY: Record<string, string> = {
  all: "No applications have been submitted yet.",
  pending: "No pending applications — you're all caught up.",
  approved: "No applications have been approved yet.",
  rejected: "No applications have been rejected.",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">Approved</span>;
  if (status === "REJECTED") return <span className="px-3 py-1 bg-danger-container text-danger text-xs font-bold rounded-full">Rejected</span>;
  return <span className="px-3 py-1 bg-warning-container text-warning text-xs font-bold rounded-full">Pending</span>;
}

function ApplicationsQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";

  const [tab, setTab] = useState(initialTab);
  const [applications, setApplications] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [appsRes, deptsRes] = await Promise.all([
          api.get(TABS.find(t => t.key === tab)?.endpoint || "/api/applications"),
          api.get("/api/departments").catch(() => [])
        ]);
        setApplications(appsRes || []);
        setDepartments(deptsRes || []);
      } catch (err: any) {
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab]);

  const filteredAndSortedRows = useMemo(() => {
    let rows = applications.filter((a) => {
      const searchStr = `${a.student?.firstName} ${a.student?.lastName} ${a.student?.admissionNumber}`.toLowerCase();
      const matchesSearch = !search || searchStr.includes(search.toLowerCase());
      const matchesDept = !deptFilter || String(a.student?.department?.departmentId) === deptFilter;
      return matchesSearch && matchesDept;
    });

    rows.sort((a, b) => {
      const getVal = (obj: any, path: string) => path.split('.').reduce((o, p) => (o ? o[p] : ""), obj);
      const av = getVal(a, sortKey) || "";
      const bv = getVal(b, sortKey) || "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [applications, search, deptFilter, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ label, sortKey: key }: { label: string, sortKey: string }) => {
    const isSorted = sortKey === key;
    const arrow = isSorted ? (sortDir === "asc" ? "arrow_upward" : "arrow_downward") : "swap_vert";
    const color = isSorted ? "text-primary font-bold" : "text-on-surface-variant font-semibold";

    return (
      <th className="py-4 px-6 cursor-pointer select-none group hover:bg-surface-container-highest transition-colors" onClick={() => handleSort(key)}>
        <div className={`flex items-center gap-1 ${color}`}>
          {label}
          <span className="material-symbols-outlined text-[14px] opacity-70 group-hover:opacity-100">{arrow}</span>
        </div>
      </th>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Applications Registry</h2>
          <p className="text-lg text-on-surface-variant mt-1">Review and manage attachment applications</p>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-container-highest pb-4">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
              tab === t.key 
                ? "bg-primary-container text-white shadow-sm ring-1 ring-primary-container ring-offset-1" 
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}>
              {t.label}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search applicant, admission number..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow font-medium" 
              type="text"
            />
          </div>
          <div className="w-full sm:w-64">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-primary tracking-tight">Current Queue</h3>
        </div>
        <div className="bg-surface-container-lowest min-h-[300px]">
          {loading ? (
             <CenteredSpinner message="Loading applications…" />
          ) : error ? (
            <p className="text-danger text-sm py-8 text-center">{error}</p>
          ) : filteredAndSortedRows.length === 0 ? (
            <div className="py-16 text-center">
              <h4 className="text-lg font-bold text-on-surface mb-1">Nothing here</h4>
              <p className="text-on-surface-variant text-sm">{EMPTY_COPY[tab]}</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                    <SortHeader label="Applicant Name" sortKey="student.lastName" />
                    <th className="py-4 px-6 font-semibold">Admission #</th>
                    <th className="py-4 px-6 font-semibold">Target Department</th>
                    <th className="py-4 px-6 font-semibold">Course</th>
                    <SortHeader label="Date Applied" sortKey="submittedAt" />
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {filteredAndSortedRows.map((a) => (
                    <tr key={a.applicationId} onClick={() => router.push(`/reviewer/applications/${a.applicationId}`)} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                            {a.student?.firstName?.charAt(0) || ''}{a.student?.lastName?.charAt(0) || ''}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{a.student?.firstName} {a.student?.lastName}</p>
                            <p className="text-xs text-on-surface-variant">{a.student?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-medium">{a.student?.admissionNumber || "—"}</td>
                      <td className="py-4 px-6 text-on-surface-variant font-medium">{a.student?.department?.name || "—"}</td>
                      <td className="py-4 px-6 text-on-surface-variant truncate max-w-[150px]" title={a.student?.courseName}>{a.student?.courseName || "—"}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{new Date(a.submittedAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6"><StatusBadge status={a.status} /></td>
                      <td className="py-4 px-6 text-right">
                        <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-sm hover:border-primary hover:text-primary transition-colors bg-white shadow-sm">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsQueue() {
  return (
    <Suspense fallback={<CenteredSpinner message="Loading applications…" />}>
      <ApplicationsQueueContent />
    </Suspense>
  );
}

