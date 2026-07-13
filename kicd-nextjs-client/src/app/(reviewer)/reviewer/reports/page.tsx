"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function ReportsDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReport, setActiveReport] = useState<"APPLICANTS" | "PLACEMENTS" | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'HR_OFFICER') {
      router.push("/reviewer/dashboard");
      return;
    }

    async function fetchData() {
      try {
        const apps = await api.get("/api/applications");
        setApplications(apps || []);
      } catch (err: any) {
        setError(err.message || "Failed to load report data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <CenteredSpinner message="Loading report data..." />;

  if (error) {
    return <div className="p-8 text-center text-danger font-bold">{error}</div>;
  }

  const approvedApps = applications.filter(a => a.status === 'APPROVED');

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="flex-1 flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full no-print">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">System Reports</h2>
            <p className="text-lg text-on-surface-variant mt-1">Preview and export data to PDF</p>
          </div>
        </header>

        {!activeReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Applicants Report Card */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport("APPLICANTS")}>
              <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">group</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">All Applicants Report</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Preview the comprehensive list of all submitted applications and their statuses.
                </p>
              </div>
              <div className="mt-auto pt-4 w-full">
                <button className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-colors flex justify-center items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">visibility</span> Preview Report
                </button>
              </div>
            </div>

            {/* Placements Report Card */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport("PLACEMENTS")}>
              <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">how_to_reg</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Approved Placements Report</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Preview a filtered report showing only the successfully approved attachments.
                </p>
              </div>
              <div className="mt-auto pt-4 w-full">
                <button className="w-full py-3 bg-success text-white rounded-lg font-bold hover:bg-success/90 transition-colors flex justify-center items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">visibility</span> Preview Report
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
              <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
              </button>
              <button onClick={handlePrint} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">print</span> Print / Save PDF
              </button>
            </div>
            
            <div className="p-8 overflow-x-auto" id="print-area">
              <div className="text-center mb-8">
                <img src="/kicd-logo.png" alt="KICD Logo" className="h-20 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-on-surface uppercase tracking-wide">
                  {activeReport === "APPLICANTS" ? "All Applicants Report" : "Approved Placements Report"}
                </h1>
                <p className="text-on-surface-variant mt-1">Generated on: {new Date().toLocaleDateString()}</p>
              </div>

              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-surface-container-highest">
                    <th className="py-3 px-4 font-bold text-sm text-on-surface">Name</th>
                    <th className="py-3 px-4 font-bold text-sm text-on-surface">University</th>
                    <th className="py-3 px-4 font-bold text-sm text-on-surface">Course</th>
                    <th className="py-3 px-4 font-bold text-sm text-on-surface">Opportunity</th>
                    {activeReport === "APPLICANTS" && <th className="py-3 px-4 font-bold text-sm text-on-surface">Status</th>}
                    {activeReport === "PLACEMENTS" && <th className="py-3 px-4 font-bold text-sm text-on-surface">Placement Date</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {(activeReport === "APPLICANTS" ? applications : approvedApps).map((app, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{app.student?.firstName} {app.student?.lastName}</td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{app.student?.university || "—"}</td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{app.student?.courseName || "—"}</td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{app.opportunity?.title || "—"}</td>
                      {activeReport === "APPLICANTS" && (
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            app.status === 'APPROVED' ? 'bg-success/20 text-success' : 
                            app.status === 'REJECTED' ? 'bg-danger-container text-danger' : 
                            'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      )}
                      {activeReport === "PLACEMENTS" && (
                        <td className="py-3 px-4 text-sm text-on-surface-variant">
                          {app.approvalDate ? new Date(app.approvalDate).toLocaleDateString() : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                  {(activeReport === "APPLICANTS" ? applications : approvedApps).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-8 pt-4 border-t border-surface-container-highest text-sm text-on-surface-variant text-center">
                CONFIDENTIAL - For Internal Use Only
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
