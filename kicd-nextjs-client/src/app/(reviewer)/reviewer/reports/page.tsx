"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

// Removed Mock Data in favor of dynamic DB calculations

type ReportTab = "INCOMING" | "COMPLIANCE" | "STRATEGY";
type ActiveReport = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null;

export default function ReportsDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<ReportTab>("INCOMING");
  const [activeReport, setActiveReport] = useState<ActiveReport>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'HR_OFFICER') {
      router.push("/reviewer/dashboard");
      return;
    }

    async function fetchData() {
      try {
        const [apps, opps, depts] = await Promise.all([
          api.get("/api/applications"),
          api.get("/api/opportunities"),
          api.get("/api/departments")
        ]);
        setApplications(apps || []);
        setOpportunities(opps || []);
        setDepartments(depts || []);
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
  if (error) return <div className="p-8 text-center text-danger font-bold">{error}</div>;

  // --- Data Calculations ---
  
  // 1. Pipeline Summary
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalApps = applications.length;

  // 2. SLA Report
  const approvedApps = applications.filter(a => a.status === 'APPROVED' && a.approvalDate);
  const totalDays = approvedApps.reduce((sum, app) => {
    const diff = new Date(app.approvalDate).getTime() - new Date(app.submittedAt).getTime();
    return sum + (diff / (1000 * 3600 * 24));
  }, 0);
  const avgSla = approvedApps.length ? (totalDays / approvedApps.length).toFixed(1) : 0;
  const pendingSlaViolations = applications.filter(a => {
    if (a.status !== 'PENDING') return false;
    const diff = new Date().getTime() - new Date(a.submittedAt).getTime();
    return (diff / (1000 * 3600 * 24)) > 5;
  });

  // 4. Document Verification
  const docAudit = approvedApps.map(app => ({
    name: `${app.student?.firstName} ${app.student?.lastName}`,
    hasResume: !!app.student?.resumeUrl,
    hasId: !!app.student?.idDocumentUrl,
  }));

  // 5. Department Capacity
  const deptAllocation = departments.map(dept => {
    const active = approvedApps.filter(a => a.opportunity?.department?.name === dept.name).length;
    return {
      name: dept.name,
      active,
      capacity: 10, // Mock capacity limit per department
      utilization: ((active / 10) * 100).toFixed(0)
    };
  });

  // 6. Academic Institution Performance
  const institutionMap = applications.reduce((acc, app) => {
    const uni = app.student?.university || 'Unknown';
    if (!acc[uni]) acc[uni] = { total: 0, approved: 0 };
    acc[uni].total++;
    if (app.status === 'APPROVED') acc[uni].approved++;
    return acc;
  }, {} as Record<string, {total: number, approved: number}>);

  // 3. Rejection Reasons
  const totalRejections = applications.filter(a => a.status === 'REJECTED').length;
  const rejectionReasonsMap = applications
    .filter(a => a.status === 'REJECTED')
    .reduce((acc, app) => {
      const reason = app.rejectionReason || "Unspecified Reason";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const rejectionReasonsData = Object.entries(rejectionReasonsMap).map(([reason, count]) => ({
    reason, count, percentage: totalRejections ? Math.round((count / totalRejections) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 7. Budget & Stipend
  const budgetData = departments.map(dept => {
    const deptApps = approvedApps.filter(a => a.opportunity?.department?.name === dept.name);
    const activeAttaches = deptApps.length;
    const totalMonthly = deptApps.reduce((sum, app) => sum + (app.opportunity?.monthlyStipend || 0), 0);
    const stipendPerStudent = activeAttaches > 0 ? (totalMonthly / activeAttaches) : 0;
    return {
      department: dept.name,
      activeAttaches,
      stipendPerStudent,
      totalMonthly,
      status: totalMonthly > 0 ? "Funded" : "Pending/Unpaid"
    };
  });

  // 8. Attendance
  const attendanceData = approvedApps.map(app => ({
    name: `${app.student?.firstName} ${app.student?.lastName}`,
    dept: app.opportunity?.department?.name || 'Unknown',
    timesheetStatus: `${app.timesheetLoggedPercentage || 0}% Logged`,
    logbookStatus: app.logbookStatus || "Not Started",
    risk: app.complianceRisk || "Unknown"
  }));

  // 9. Evaluations
  const evaluationsData = approvedApps.map(app => ({
    name: `${app.student?.firstName} ${app.student?.lastName}`,
    score: app.overallScore ? `${app.overallScore}/5.0` : "N/A",
    punctuality: app.punctuality || "N/A",
    teamwork: app.teamwork || "N/A",
    recommendation: app.supervisorRecommendation || "N/A"
  }));

  // 10. Exit Report
  const completedApps = approvedApps.filter(a => a.exitCompletionStatus);
  const totalCompleted = completedApps.length;
  const earlyTerminations = completedApps.filter(a => a.exitCompletionStatus === 'EARLY_TERMINATION').length;
  const conversions = completedApps.filter(a => a.conversionStatus === 'HIRED').length;
  const totalSentiment = completedApps.reduce((sum, app) => sum + (app.exitSurveySentiment || 0), 0);
  
  const completionRate = totalCompleted ? Math.round(((totalCompleted - earlyTerminations) / totalCompleted) * 100) : 0;
  const earlyTermRate = totalCompleted ? Math.round((earlyTerminations / totalCompleted) * 100) : 0;
  const conversionRate = totalCompleted ? Math.round((conversions / totalCompleted) * 100) : 0;
  const avgSentiment = totalCompleted && totalSentiment ? (totalSentiment / totalCompleted).toFixed(1) : "0.0";

  const exitReportData = [
    { metric: "Completion Rate", value: `${completionRate}%` },
    { metric: "Early Termination", value: `${earlyTermRate}%` },
    { metric: "Conversion to Contract/Permanent", value: `${conversionRate}%` },
    { metric: "Avg Exit Survey Sentiment", value: `${avgSentiment}/5.0` },
  ];

  const renderReportContent = () => {
    switch (activeReport) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Application Pipeline & Status Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 no-print">
              <div className="bg-surface-container-highest p-6 rounded-2xl text-center shadow-sm"><p className="text-4xl font-bold text-on-surface mb-2">{totalApps}</p><p className="text-sm font-semibold">Total Applications</p></div>
              <div className="bg-warning-container p-6 rounded-2xl text-center shadow-sm"><p className="text-4xl font-bold text-warning mb-2">{statusCounts['PENDING'] || 0}</p><p className="text-sm font-semibold text-warning">Pending Review</p></div>
              <div className="bg-success/20 p-6 rounded-2xl text-center shadow-sm"><p className="text-4xl font-bold text-success mb-2">{statusCounts['APPROVED'] || 0}</p><p className="text-sm font-semibold text-success">Approved (Offered)</p></div>
              <div className="bg-danger-container p-6 rounded-2xl text-center shadow-sm"><p className="text-4xl font-bold text-danger mb-2">{statusCounts['REJECTED'] || 0}</p><p className="text-sm font-semibold text-danger">Rejected</p></div>
            </div>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">App ID</th><th className="py-3 px-4 text-sm font-bold">Candidate</th><th className="py-3 px-4 text-sm font-bold">Opportunity</th><th className="py-3 px-4 text-sm font-bold">Status</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {applications.map(app => (
                  <tr key={app.applicationId} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm">#{app.applicationId}</td>
                    <td className="py-3 px-4 text-sm font-medium">{app.student?.firstName} {app.student?.lastName}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{app.opportunity?.title}</td>
                    <td className="py-3 px-4 text-sm font-bold">{app.status}</td>
                  </tr>
                ))}
               </tbody>
            </table>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. HR Approver Performance & SLA Report</h2>
            <div className="mb-8 p-6 bg-primary-container rounded-2xl flex items-center gap-6 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-primary">timer</span>
              <div><p className="text-sm font-semibold mb-1">Average Time-to-Hire (Approval SLA)</p><p className="text-3xl font-bold">{avgSla} Days</p></div>
            </div>
            <h3 className="text-lg font-bold text-danger mb-4 flex items-center gap-2"><span className="material-symbols-outlined">warning</span> SLA Violations (Pending &gt; 5 Days)</h3>
            {pendingSlaViolations.length === 0 ? <div className="p-4 bg-success/10 rounded-xl text-success font-bold flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> No SLA violations currently.</div> : (
              <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                 <thead className="bg-danger-container/50">
                  <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Candidate</th><th className="py-3 px-4 text-sm font-bold">Submitted Date</th><th className="py-3 px-4 text-sm font-bold">Days Pending</th></tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant/30">
                  {pendingSlaViolations.map(app => {
                    const days = ((new Date().getTime() - new Date(app.submittedAt).getTime()) / (1000 * 3600 * 24)).toFixed(0);
                    return (
                      <tr key={app.applicationId} className="hover:bg-surface-container-lowest text-danger font-medium">
                        <td className="py-3 px-4 text-sm">{app.student?.firstName} {app.student?.lastName}</td>
                        <td className="py-3 px-4 text-sm">{new Date(app.submittedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm">{days} Days</td>
                      </tr>
                    )
                  })}
                 </tbody>
              </table>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Candidate Rejection Reason Analysis (Mock)</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Rejection Category</th><th className="py-3 px-4 text-sm font-bold">Count</th><th className="py-3 px-4 text-sm font-bold">% of Rejections</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {rejectionReasonsData.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{r.reason}</td>
                    <td className="py-3 px-4 text-sm">{r.count}</td>
                    <td className="py-3 px-4 text-sm font-bold text-danger">{r.percentage}%</td>
                  </tr>
                ))}
                {rejectionReasonsData.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant">No rejection data available.</td></tr>}
               </tbody>
            </table>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Document Verification & Compliance Audit</h2>
            <p className="mb-6 text-on-surface-variant font-medium">Checking essential document uploads for all APPROVED placements.</p>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Candidate</th><th className="py-3 px-4 text-sm font-bold">Resume Uploaded</th><th className="py-3 px-4 text-sm font-bold">National ID Uploaded</th><th className="py-3 px-4 text-sm font-bold">Overall Status</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {docAudit.map((doc, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{doc.name}</td>
                    <td className="py-3 px-4 text-sm">{doc.hasResume ? <span className="text-success font-bold">✅ Yes</span> : <span className="text-danger font-bold">❌ Missing</span>}</td>
                    <td className="py-3 px-4 text-sm">{doc.hasId ? <span className="text-success font-bold">✅ Yes</span> : <span className="text-danger font-bold">❌ Missing</span>}</td>
                    <td className="py-3 px-4 text-sm font-bold">{(!doc.hasResume || !doc.hasId) ? <span className="text-danger bg-danger-container px-2 py-1 rounded">Non-Compliant</span> : <span className="text-success bg-success/20 px-2 py-1 rounded">Compliant</span>}</td>
                  </tr>
                ))}
                {docAudit.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant">No approved candidates to audit.</td></tr>}
               </tbody>
            </table>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Departmental Capacity & Allocation Report</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Department</th><th className="py-3 px-4 text-sm font-bold">Active Attaches</th><th className="py-3 px-4 text-sm font-bold">Capacity Target</th><th className="py-3 px-4 text-sm font-bold">Utilization</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {deptAllocation.map((d, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{d.name}</td>
                    <td className="py-3 px-4 text-sm">{d.active}</td>
                    <td className="py-3 px-4 text-sm">{d.capacity}</td>
                    <td className="py-3 px-4 text-sm font-bold">
                      <span className={`px-2 py-1 rounded ${parseInt(d.utilization) >= 100 ? "bg-danger-container text-danger" : "bg-success/20 text-success"}`}>{d.utilization}%</span>
                    </td>
                  </tr>
                ))}
               </tbody>
            </table>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Academic Institution Performance & Relationship</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Institution / University</th><th className="py-3 px-4 text-sm font-bold">Total Applicants</th><th className="py-3 px-4 text-sm font-bold">Approved Placements</th><th className="py-3 px-4 text-sm font-bold">Success Ratio</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {Object.entries(institutionMap).map(([uni, stats], i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{uni}</td>
                    <td className="py-3 px-4 text-sm">{stats.total}</td>
                    <td className="py-3 px-4 text-sm">{stats.approved}</td>
                    <td className="py-3 px-4 text-sm font-bold text-primary">{((stats.approved / stats.total) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
               </tbody>
            </table>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">7. Budget & Stipend Allocation Report</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Cost Center</th><th className="py-3 px-4 text-sm font-bold">Attaches</th><th className="py-3 px-4 text-sm font-bold">Stipend/Student (KES)</th><th className="py-3 px-4 text-sm font-bold">Total Monthly (KES)</th><th className="py-3 px-4 text-sm font-bold">Status</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {budgetData.map((b, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{b.department}</td>
                    <td className="py-3 px-4 text-sm">{b.activeAttaches}</td>
                    <td className="py-3 px-4 text-sm">{b.stipendPerStudent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-bold">{b.totalMonthly.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Funded' ? 'bg-success/20 text-success' : 'bg-warning-container text-warning'}`}>{b.status}</span></td>
                  </tr>
                ))}
               </tbody>
            </table>
          </div>
        );
      case 8:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">8. Attaché Attendance & Logbook Compliance</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Attaché Name</th><th className="py-3 px-4 text-sm font-bold">Department</th><th className="py-3 px-4 text-sm font-bold">Timesheet Logged</th><th className="py-3 px-4 text-sm font-bold">Logbook Status</th><th className="py-3 px-4 text-sm font-bold">Compliance Risk</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {attendanceData.map((a, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{a.name}</td>
                    <td className="py-3 px-4 text-sm text-on-surface-variant">{a.dept}</td>
                    <td className="py-3 px-4 text-sm">{a.timesheetStatus}</td>
                    <td className="py-3 px-4 text-sm">{a.logbookStatus}</td>
                    <td className="py-3 px-4 text-sm"><span className={`px-2 py-1 rounded text-xs font-bold ${a.risk === 'High' ? 'bg-danger-container text-danger' : a.risk === 'Medium' ? 'bg-warning-container text-warning' : 'bg-success/20 text-success'}`}>{a.risk} Risk</span></td>
                  </tr>
                ))}
                {attendanceData.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No approved attachés to track.</td></tr>}
               </tbody>
            </table>
          </div>
        );
      case 9:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary">9. Mid-Term & Final Performance Evaluation</h2>
            <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
               <thead className="bg-surface-container-lowest">
                <tr className="border-b border-outline-variant"><th className="py-3 px-4 text-sm font-bold">Attaché Name</th><th className="py-3 px-4 text-sm font-bold">Overall Score</th><th className="py-3 px-4 text-sm font-bold">Punctuality</th><th className="py-3 px-4 text-sm font-bold">Teamwork</th><th className="py-3 px-4 text-sm font-bold">Supervisor Rec.</th></tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/30">
                {evaluationsData.map((e, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-4 text-sm font-medium">{e.name}</td>
                    <td className="py-3 px-4 text-sm font-bold text-primary">{e.score}</td>
                    <td className="py-3 px-4 text-sm">{e.punctuality}</td>
                    <td className="py-3 px-4 text-sm">{e.teamwork}</td>
                    <td className="py-3 px-4 text-sm"><span className={`font-bold ${e.recommendation === 'Highly Recommended' ? 'text-success' : 'text-on-surface-variant'}`}>{e.recommendation}</span></td>
                  </tr>
                ))}
                {evaluationsData.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No evaluation data available.</td></tr>}
               </tbody>
            </table>
          </div>
        );
      case 10:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">10. Post-Attachment Conversion & Exit Report</h2>
            <div className="grid grid-cols-2 gap-6">
              {exitReportData.map((e, i) => (
                <div key={i} className="bg-white border border-outline-variant p-8 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
                  <p className="text-5xl font-bold text-primary mb-3">{e.value}</p>
                  <p className="text-on-surface-variant font-semibold">{e.metric}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
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
          <h2 className="text-3xl font-bold text-primary tracking-tight">HR Intelligence & Reports</h2>
          <p className="text-lg text-on-surface-variant mt-1">Analytics, Compliance, and Pipeline insights.</p>
        </header>

        {!activeReport ? (
          <div className="flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-outline-variant pb-0 overflow-x-auto">
              <button onClick={() => setActiveTab("INCOMING")} className={`px-8 py-4 rounded-t-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'INCOMING' ? 'bg-primary text-white border-b-4 border-primary' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border-b-4 border-transparent'}`}>1. Incoming & Workflow</button>
              <button onClick={() => setActiveTab("COMPLIANCE")} className={`px-8 py-4 rounded-t-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'COMPLIANCE' ? 'bg-primary text-white border-b-4 border-primary' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border-b-4 border-transparent'}`}>2. In-Progress & Compliance</button>
              <button onClick={() => setActiveTab("STRATEGY")} className={`px-8 py-4 rounded-t-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'STRATEGY' ? 'bg-primary text-white border-b-4 border-primary' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border-b-4 border-transparent'}`}>3. Strategy & Outcomes</button>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              
              {activeTab === "INCOMING" && (
                <>
                  <ReportCard title="1. Pipeline & Status Summary" desc="Birds-eye view of applicant funnel." icon="view_kanban" onClick={() => setActiveReport(1)} />
                  <ReportCard title="2. HR Approver SLA Report" desc="Track approval speed & bottlenecks." icon="timer" onClick={() => setActiveReport(2)} />
                  <ReportCard title="3. Rejection Reason Analysis" desc="Understand why candidates are rejected." icon="block" onClick={() => setActiveReport(3)} />
                </>
              )}

              {activeTab === "COMPLIANCE" && (
                <>
                  <ReportCard title="4. Document Verification Audit" desc="Check mandatory uploads for compliance." icon="fact_check" onClick={() => setActiveReport(4)} />
                  <ReportCard title="5. Departmental Allocation" desc="Track capacities and mentor ratios." icon="account_tree" onClick={() => setActiveReport(5)} />
                  <ReportCard title="6. Academic Performance" desc="Approval rates by University." icon="school" onClick={() => setActiveReport(6)} />
                  <ReportCard title="7. Budget & Stipend Report" desc="Financial tracking by department." icon="payments" onClick={() => setActiveReport(7)} />
                </>
              )}

              {activeTab === "STRATEGY" && (
                <>
                  <ReportCard title="8. Attaché Attendance Log" desc="Monitor timesheet and logbook compliance." icon="calendar_clock" onClick={() => setActiveReport(8)} />
                  <ReportCard title="9. Mid-Term Performance" desc="Supervisor evaluations and scoring." icon="grade" onClick={() => setActiveReport(9)} />
                  <ReportCard title="10. Post-Attachment Exit" desc="Conversion rates and exit surveys." icon="exit_to_app" onClick={() => setActiveReport(10)} />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-outline-variant rounded-2xl shadow-lg flex flex-col overflow-hidden">
            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between no-print">
              <button onClick={() => setActiveReport(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Dash
              </button>
              <button onClick={handlePrint} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">print</span> Print / Save PDF
              </button>
            </div>
            
            <div className="p-8 overflow-x-auto bg-surface" id="print-area">
              <div className="text-center mb-10 pb-6 border-b-2 border-primary">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-container text-on-primary-container mb-4">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <h1 className="text-3xl font-bold text-on-surface uppercase tracking-wide">KICD HR REPORT</h1>
                <p className="text-on-surface-variant font-medium mt-1">Generated: {new Date().toLocaleString()}</p>
              </div>
              
              <div className="min-w-[800px]">
                {renderReportContent()}
              </div>

              <div className="mt-16 pt-6 border-t-2 border-outline-variant text-sm text-on-surface-variant font-medium flex justify-between">
                <span>CONFIDENTIAL - KICD Human Resources Portal</span>
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
