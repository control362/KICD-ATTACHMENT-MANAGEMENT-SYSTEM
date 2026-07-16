"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";

export default function SysAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [storageMetrics, setStorageMetrics] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

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

  if (loading) return <CenteredSpinner message="Loading system metrics..." />;
  if (error) return <div className="text-danger p-8 text-center font-bold">{error}</div>;

  if (selectedMetric && selectedMetric.startsWith('files_')) {
    return (
      <FilesDetailView
        metricType={selectedMetric}
        fileDetails={storageMetrics?.fileDetails || []}
        onBack={() => setSelectedMetric(null)}
      />
    );
  }

  if (selectedMetric) {
    return (
      <UsersDetailView 
        metricType={selectedMetric}
        usersDetails={userMetrics?.usersDetails || []}
        onBack={() => setSelectedMetric(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">SysAdmin Dashboard</h1>
        <p className="text-on-surface-variant mt-2">Production System Telemetry & Auditing</p>
      </div>

      <div className="flex border-b border-surface-container-highest">
        {['users', 'infrastructure', 'storage'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'text-primary border-primary bg-primary-container/20' : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-low'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Users" value={userMetrics?.totalUsers || 0} icon="group" color="primary" onClick={() => setSelectedMetric('total')} />
          <MetricCard title="Dormant Accounts" value={userMetrics?.dormantUsers || 0} icon="person_off" color="warning" subtitle="> 30 days inactive" onClick={() => setSelectedMetric('dormant')} />
          <MetricCard title="Locked Accounts" value={userMetrics?.lockedAccounts || 0} icon="lock" color="danger" onClick={() => setSelectedMetric('locked')} />
          <MetricCard title="MFA Adoption Rate" value={`${userMetrics?.mfaComplianceRate || 0}%`} icon="verified_user" color="success" onClick={() => setSelectedMetric('mfa')} />
          
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant">
            <h2 className="text-xl font-bold mb-4">Role Distribution Matrix</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(userMetrics?.roleDistribution || {}).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-xl border border-surface-container-highest">
                  <span className="font-semibold text-on-surface-variant">{String(role).replace('ROLE_', '')}</span>
                  <span className="text-xl font-bold text-primary">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'infrastructure' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col items-center justify-center min-h-[200px]">
               <span className={`material-symbols-outlined text-[64px] ${healthStatus?.status === 'UP' ? 'text-success' : 'text-danger'}`}>
                 {healthStatus?.status === 'UP' ? 'check_circle' : 'error'}
               </span>
               <h2 className="text-2xl font-bold mt-4">System Status: {healthStatus?.status}</h2>
               <p className="text-on-surface-variant mt-2">API Endpoints & Database Connection</p>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-center">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">memory</span> Active Telemetry Services
               </h2>
               <ul className="space-y-4">
                 <li className="flex justify-between items-center pb-2 border-b border-surface-container-highest">
                   <span className="font-medium text-on-surface-variant">PostgreSQL Connection Pool</span>
                   <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold">Healthy</span>
                 </li>
                 <li className="flex justify-between items-center pb-2 border-b border-surface-container-highest">
                   <span className="font-medium text-on-surface-variant">JWT Authentication Filter</span>
                   <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold">Active</span>
                 </li>
                 <li className="flex justify-between items-center pb-2">
                   <span className="font-medium text-on-surface-variant">Actuator Environment</span>
                   <span className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-bold">Exposed</span>
                 </li>
               </ul>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <MetricCard title="Estimated Storage Used" value={`${storageMetrics?.estimatedStorageMB?.toFixed(2) || 0} MB`} icon="hard_drive" color="primary" />
           <MetricCard title="Total Blobs (Files)" value={storageMetrics?.totalFiles || 0} icon="folder" color="primary" />
           <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-outline-variant">
            <h2 className="text-xl font-bold mb-4">Blob Storage Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div onClick={() => setSelectedMetric('files_resume')} className="p-4 bg-surface-container-lowest rounded-xl flex items-center gap-4 border border-outline-variant cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
                 <span className="material-symbols-outlined text-3xl text-primary">description</span>
                 <div>
                   <p className="font-bold text-xl">{storageMetrics?.resumesCount}</p>
                   <p className="text-sm text-on-surface-variant">CVs / Resumes</p>
                 </div>
              </div>
              <div onClick={() => setSelectedMetric('files_id')} className="p-4 bg-surface-container-lowest rounded-xl flex items-center gap-4 border border-outline-variant cursor-pointer hover:shadow-md hover:primary/50 transition-all">
                 <span className="material-symbols-outlined text-3xl text-primary">badge</span>
                 <div>
                   <p className="font-bold text-xl">{storageMetrics?.idDocumentsCount}</p>
                   <p className="text-sm text-on-surface-variant">ID Documents</p>
                 </div>
              </div>
              <div onClick={() => setSelectedMetric('files_profile')} className="p-4 bg-surface-container-lowest rounded-xl flex items-center gap-4 border border-outline-variant cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
                 <span className="material-symbols-outlined text-3xl text-primary">account_circle</span>
                 <div>
                   <p className="font-bold text-xl">{storageMetrics?.profilePhotosCount}</p>
                   <p className="text-sm text-on-surface-variant">Profile Photos</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle, onClick }: { title: string, value: string | number, icon: string, color: string, subtitle?: string, onClick?: () => void }) {
  const colorMap: any = {
    primary: "text-primary bg-primary-container",
    danger: "text-danger bg-danger-container",
    success: "text-success bg-success/20",
    warning: "text-warning bg-warning-container",
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-between transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : 'hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-on-surface-variant text-sm uppercase tracking-wide">{title}</h3>
        <span className={`material-symbols-outlined p-2 rounded-xl ${colorMap[color]}`}>
          {icon}
        </span>
      </div>
      <div>
        <div className="text-4xl font-bold text-on-surface">{value}</div>
        {subtitle && <div className="text-xs text-on-surface-variant mt-2 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}


function UsersDetailView({ metricType, usersDetails, onBack }: { metricType: string, usersDetails: any[], onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  let filteredUsers = usersDetails;
  let title = "Total Users";
  
  if (metricType === "dormant") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filteredUsers = usersDetails.filter(u => !u.lastLoginAt || new Date(u.lastLoginAt) < thirtyDaysAgo);
    title = "Dormant Accounts";
  } else if (metricType === "locked") {
    filteredUsers = usersDetails.filter(u => u.accountLockedUntil && new Date(u.accountLockedUntil) > new Date());
    title = "Locked Accounts";
  } else if (metricType === "mfa") {
    filteredUsers = usersDetails.filter(u => u.mfaEnabled);
    title = "Users with MFA Enabled";
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.email.toLowerCase().includes(q) || 
      String(u.role).toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center text-on-surface-variant border border-outline-variant bg-white shadow-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
            <p className="text-on-surface-variant mt-1 font-medium">{filteredUsers.length} Users Found</p>
          </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search by email or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-[300px] shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-surface-container-lowest border-b border-outline-variant">
            <tr>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant">User Email</th>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant text-right">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={3} className="py-16 text-center text-on-surface-variant font-medium">No users match your search criteria.</td></tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user.userId} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6 font-bold text-on-surface text-[15px]">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/50">
                      {String(user.role).replace("ROLE_", "")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-right text-on-surface-variant">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never Logged In"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilesDetailView({ metricType, fileDetails, onBack }: { metricType: string, fileDetails: any[], onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  let targetType = "resume";
  let title = "CVs & Resumes";
  let icon = "description";
  
  if (metricType === "files_id") {
    targetType = "id";
    title = "ID Documents";
    icon = "badge";
  } else if (metricType === "files_profile") {
    targetType = "profile";
    title = "Profile Photos";
    icon = "account_circle";
  }

  let filteredFiles = fileDetails.filter(f => f.type === targetType);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredFiles = filteredFiles.filter(f => 
      f.ownerEmail.toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center text-on-surface-variant border border-outline-variant bg-white shadow-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">{icon}</span> {title}
            </h1>
            <p className="text-on-surface-variant mt-1 font-medium">{filteredFiles.length} files stored</p>
          </div>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search by owner email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-[300px] shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-surface-container-lowest border-b border-outline-variant">
            <tr>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant">Owner Email</th>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant">Timestamp</th>
              <th className="py-4 px-6 text-sm font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filteredFiles.length === 0 ? (
              <tr><td colSpan={3} className="py-16 text-center text-on-surface-variant font-medium">No files match your search criteria.</td></tr>
            ) : (
              filteredFiles.map((f: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-6 font-bold text-on-surface text-[15px]">{f.ownerEmail}</td>
                  <td className="py-4 px-6 text-sm font-medium text-on-surface-variant">
                    {f.timestamp ? new Date(f.timestamp).toLocaleString() : "—"}
                  </td>
                  <td className="py-4 px-6 text-right">
                     <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-colors">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span> View File
                     </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
