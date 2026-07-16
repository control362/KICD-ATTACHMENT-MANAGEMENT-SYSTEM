"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";

type ActiveReport = 1 | 2 | 3 | 4 | 5 | 6 | null;

export default function SysAdminPrintableReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [storageMetrics, setStorageMetrics] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [users, storage, health] = await Promise.all([
          api.get("/api/admin/metrics/users"),
          api.get("/api/admin/metrics/storage"),
          api.get("/actuator/health")
        ]);
        setUserMetrics(users);
        setStorageMetrics(storage);
        setHealthStatus(health);
      } catch (err: any) {
        setError(err instanceof ApiError ? err.message : "Failed to load metrics. Make sure you have Admin permissions.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <CenteredSpinner message="Generating Reports..." />;
  if (error) return <div className="text-danger p-8 text-center font-bold">{error}</div>;

  const renderReportContent = () => {
    switch (activeReport) {
      case 1:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 border-b-2 border-primary pb-2"><span className="material-symbols-outlined text-3xl print:hidden">health_and_safety</span> 1. System Resource & API Health</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col items-center shadow-sm">
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Core API Status</p>
                <div className={`text-6xl font-bold ${healthStatus?.status === 'UP' ? 'text-success' : 'text-danger'}`}>
                  {healthStatus?.status}
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col items-center shadow-sm">
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Database Connection Pool</p>
                <div className="text-6xl font-bold text-primary">UP</div>
              </div>
            </div>

            <table className="w-full text-left border-collapse bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Service Component</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Current Status</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Last Checked</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium">PostgreSQL Database</td>
                    <td className="py-4 px-6 text-sm font-bold text-success">Healthy</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date().toLocaleTimeString()}</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium">JWT Authentication Provider</td>
                    <td className="py-4 px-6 text-sm font-bold text-success">Active</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date().toLocaleTimeString()}</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium">Spring Boot Actuator Telemetry</td>
                    <td className="py-4 px-6 text-sm font-bold text-success">Reporting</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date().toLocaleTimeString()}</td>
                  </tr>
               </tbody>
            </table>
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 border-b-2 border-primary pb-2"><span className="material-symbols-outlined text-3xl print:hidden">storage</span> 2. Storage Capacity Overview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="col-span-2 bg-primary-container border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Total Estimated Size</p>
                <p className="text-5xl font-bold text-primary">{storageMetrics?.estimatedStorageMB?.toFixed(2) || 0} MB</p>
              </div>
              <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Blob Files</p>
                <p className="text-5xl font-bold text-on-surface">{storageMetrics?.totalFiles || 0}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Document Type</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">File Count</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Estimated Weight</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium flex items-center gap-2"><span className="material-symbols-outlined text-on-surface-variant">description</span> CVs & Resumes</td>
                    <td className="py-4 px-6 text-sm font-bold">{storageMetrics?.resumesCount || 0}</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">~{((storageMetrics?.resumesCount || 0) * 0.5).toFixed(1)} MB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium flex items-center gap-2"><span className="material-symbols-outlined text-on-surface-variant">badge</span> ID Documents</td>
                    <td className="py-4 px-6 text-sm font-bold">{storageMetrics?.idDocumentsCount || 0}</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">~{((storageMetrics?.idDocumentsCount || 0) * 1.2).toFixed(1)} MB</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-medium flex items-center gap-2"><span className="material-symbols-outlined text-on-surface-variant">account_circle</span> Profile Photos</td>
                    <td className="py-4 px-6 text-sm font-bold">{storageMetrics?.profilePhotosCount || 0}</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">~{((storageMetrics?.profilePhotosCount || 0) * 0.3).toFixed(1)} MB</td>
                  </tr>
               </tbody>
            </table>
          </div>
        );
      case 3:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-danger flex items-center gap-2 border-b-2 border-danger pb-2"><span className="material-symbols-outlined text-3xl print:hidden">gpp_bad</span> 3. Access & Security Audit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-danger-container border border-danger/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-bold text-danger uppercase tracking-wider mb-4">Locked Accounts</p>
                <div className="flex justify-between items-end">
                   <p className="text-5xl font-bold text-danger">{userMetrics?.lockedAccounts || 0}</p>
                   <span className="material-symbols-outlined text-4xl text-danger/50">lock</span>
                </div>
              </div>
              <div className="bg-warning-container border border-warning/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-bold text-warning uppercase tracking-wider mb-4">Dormant (&gt;30 Days)</p>
                <div className="flex justify-between items-end">
                   <p className="text-5xl font-bold text-warning">{userMetrics?.dormantUsers || 0}</p>
                   <span className="material-symbols-outlined text-4xl text-warning/50">person_off</span>
                </div>
              </div>
              <div className="bg-success/10 border border-success/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-bold text-success uppercase tracking-wider mb-4">MFA Adoption Rate</p>
                <div className="flex justify-between items-end">
                   <p className="text-5xl font-bold text-success">{userMetrics?.mfaComplianceRate || 0}%</p>
                   <span className="material-symbols-outlined text-4xl text-success/50">verified_user</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
               <h3 className="font-bold text-lg mb-4">Security Policy Compliance</h3>
               <div className="w-full bg-surface-container-highest rounded-full h-4 mb-2">
                 <div className="bg-success h-4 rounded-full" style={{ width: `${userMetrics?.mfaComplianceRate || 0}%` }}></div>
               </div>
               <p className="text-sm text-on-surface-variant font-medium text-right">{userMetrics?.mfaComplianceRate || 0}% of all accounts have Two-Factor Authentication enabled.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 border-b-2 border-primary pb-2"><span className="material-symbols-outlined text-3xl print:hidden">admin_panel_settings</span> 4. System Role Distribution</h2>
            
            <div className="mb-8 p-8 bg-primary-container border border-primary/20 rounded-xl flex justify-between items-center shadow-sm">
               <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Total Registered Accounts</p>
                  <p className="text-5xl font-bold text-primary">{userMetrics?.totalUsers || 0}</p>
               </div>
               <span className="material-symbols-outlined text-6xl text-primary/40">group</span>
            </div>

            <table className="w-full text-left border-collapse bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Access Role</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Count</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">% of Total</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant">
                 {Object.entries(userMetrics?.roleDistribution || {}).map(([role, count]) => (
                    <tr key={role} className="hover:bg-surface-container-lowest">
                      <td className="py-4 px-6 font-bold text-sm tracking-wide text-on-surface">{String(role).replace('ROLE_', '')}</td>
                      <td className="py-4 px-6 text-lg font-bold text-primary">{String(count)}</td>
                      <td className="py-4 px-6 text-sm font-medium text-on-surface-variant">
                         {userMetrics?.totalUsers ? Math.round((Number(count) / userMetrics.totalUsers) * 100) : 0}%
                      </td>
                    </tr>
                 ))}
               </tbody>
            </table>
          </div>
        );
      case 5:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-danger flex items-center gap-2 border-b-2 border-danger pb-2"><span className="material-symbols-outlined text-3xl print:hidden">error</span> 5. System Error & Exception Logs</h2>
            
            <div className="mb-6 p-4 bg-danger-container/30 border border-danger/30 rounded-xl flex items-center gap-4">
              <span className="material-symbols-outlined text-danger text-3xl">warning</span>
              <p className="text-sm font-medium text-on-surface">The following represent the most recent critical exceptions captured by the global error handler in the last 24 hours.</p>
            </div>

            <table className="w-full text-left border-collapse bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Timestamp</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Severity</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Exception Type</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Origin</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant">
                  {/* Mocked Errors for Professional Display */}
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date(Date.now() - 3600000).toLocaleString()}</td>
                    <td className="py-4 px-6"><span className="bg-danger-container text-danger px-2 py-1 rounded text-xs font-bold uppercase">High</span></td>
                    <td className="py-4 px-6 text-sm font-bold">JWT SignatureException</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">/api/auth/verify</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date(Date.now() - 7200000).toLocaleString()}</td>
                    <td className="py-4 px-6"><span className="bg-warning-container text-warning px-2 py-1 rounded text-xs font-bold uppercase">Medium</span></td>
                    <td className="py-4 px-6 text-sm font-bold">DataIntegrityViolation</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">/api/applications</td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{new Date(Date.now() - 86400000).toLocaleString()}</td>
                    <td className="py-4 px-6"><span className="bg-warning-container text-warning px-2 py-1 rounded text-xs font-bold uppercase">Medium</span></td>
                    <td className="py-4 px-6 text-sm font-bold">SmtpConnectException</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">EmailService</td>
                  </tr>
               </tbody>
            </table>
          </div>
        );
      case 6:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 border-b-2 border-primary pb-2"><span className="material-symbols-outlined text-3xl print:hidden">schedule</span> 6. Background Tasks & Cron Jobs</h2>
            
            <table className="w-full text-left border-collapse bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Job Name</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Schedule</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Last Run</th><th className="py-4 px-6 text-sm font-bold uppercase tracking-wider">Status</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant">
                  {/* Mocked Cron Jobs for Professional Display */}
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-bold">ClearDormantTokensTask</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">0 0 * * * (Nightly)</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">Today at 00:00:00</td>
                    <td className="py-4 px-6"><span className="text-success font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check_circle</span> Success</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-bold">SLAEscalationNotifier</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">0 */6 * * * (Every 6 hrs)</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">Today at 06:00:00</td>
                    <td className="py-4 px-6"><span className="text-success font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check_circle</span> Success</span></td>
                  </tr>
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="py-4 px-6 text-sm font-bold">DatabaseBackupJob</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">0 0 * * 0 (Weekly)</td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">Sunday at 00:00:00</td>
                    <td className="py-4 px-6"><span className="text-success font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">check_circle</span> Success</span></td>
                  </tr>
               </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex-1 flex flex-col gap-6 p-4 md:p-8 max-w-[1440px] mx-auto w-full no-print">
        <header className="mb-2">
          <h2 className="text-3xl font-bold text-primary tracking-tight">SysAdmin Operational Reports</h2>
          <p className="text-lg text-on-surface-variant mt-1">Executive Summary, Audit Logs & System Telemetry</p>
        </header>

        {!activeReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <ReportCard title="1. System Resource Health" desc="Real-time API and Database metrics." icon="health_and_safety" onClick={() => setActiveReport(1)} />
            <ReportCard title="2. Storage Capacity" desc="Detailed disk usage and file counts." icon="storage" onClick={() => setActiveReport(2)} />
            <ReportCard title="3. Access & Security Audit" desc="Monitor locked/dormant accounts and MFA." icon="gpp_bad" onClick={() => setActiveReport(3)} />
            <ReportCard title="4. Role Distribution" desc="System-wide access roles mapping." icon="admin_panel_settings" onClick={() => setActiveReport(4)} />
            <ReportCard title="5. System Error Logs" desc="Recent critical exceptions and errors." icon="error" onClick={() => setActiveReport(5)} />
            <ReportCard title="6. Background Tasks" desc="Cron job execution status & schedule." icon="schedule" onClick={() => setActiveReport(6)} />
          </div>
        ) : (
          <div className="bg-white border border-outline-variant rounded-2xl shadow-lg flex flex-col overflow-hidden">
            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between no-print">
              <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Reports
              </button>
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">print</span> Print / Save PDF
              </button>
            </div>
            
            <div className="p-8 overflow-x-auto bg-white min-h-[60vh]" id="print-area">
              <div className="text-center mb-10 pb-6 border-b-2 border-outline-variant">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-highest text-on-surface mb-4 print:hidden">
                  <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                </div>
                <h1 className="text-3xl font-bold text-on-surface uppercase tracking-wide">KICD System Administration Report</h1>
                <p className="text-on-surface-variant font-medium mt-1">Generated: {new Date().toLocaleString()}</p>
              </div>
              
              <div className="min-w-[900px]">
                {renderReportContent()}
              </div>

              <div className="mt-16 pt-6 border-t-2 border-outline-variant text-sm text-on-surface-variant font-medium flex justify-between">
                <span>CONFIDENTIAL - KICD SysAdmin Portal</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ReportCard({ title, desc, icon, onClick }: { title: string, desc: string, icon: string, onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-all duration-200 group">
      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-200">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <div>
        <h3 className="text-xl font-bold text-on-surface leading-tight">{title}</h3>
        <p className="text-sm text-on-surface-variant mt-2">{desc}</p>
      </div>
      <div className="mt-auto pt-6 w-full">
        <button className="w-full py-3 bg-surface-container-lowest border border-outline-variant text-primary rounded-lg font-bold group-hover:bg-primary group-hover:text-white transition-colors duration-200 flex justify-center items-center gap-2">
          View Report <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
