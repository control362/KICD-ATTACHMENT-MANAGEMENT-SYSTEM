"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CenteredSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";

export default function OpportunityManagement() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get("/api/opportunities");
        setOpportunities(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch opportunities");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <CenteredSpinner message="Loading opportunities..." />;

  if (user?.role !== 'ADMIN' && user?.role !== 'HR_OFFICER') {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-danger mb-2">Access Denied</h2>
        <p className="text-on-surface-variant">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Opportunity Management</h1>
        </div>
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          <Link href="/reviewer/opportunities/new" className="btn bg-[#001c3d] hover:bg-blue-800 text-white flex items-center px-4 py-2 rounded-lg shadow-sm font-medium transition-colors">
            <svg className="w-4 h-4 fill-current opacity-50 shrink-0 mr-2" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            Post New Opportunity
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ul className="flex flex-wrap -m-1">
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-transparent shadow-sm bg-[#001c3d] text-white transition duration-150 ease-in-out">All</button>
          </li>
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 hover:border-slate-300 shadow-sm bg-white text-slate-500 transition duration-150 ease-in-out">Published</button>
          </li>
          <li className="m-1">
            <button className="inline-flex items-center justify-center text-sm font-medium leading-5 rounded-full px-3 py-1 border border-slate-200 hover:border-slate-300 shadow-sm bg-white text-slate-500 transition duration-150 ease-in-out">Drafts</button>
          </li>
        </ul>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">Title</th>
                <th scope="col" className="px-6 py-4">Type</th>
                <th scope="col" className="px-6 py-4">Department</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Deadline</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-danger">{error}</td></tr>
              ) : opportunities.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No opportunities found.</td></tr>
              ) : opportunities.map(opp => (
                <tr key={opp.opportunityId} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{opp.title}</div>
                    <div className="text-xs text-gray-400 font-normal mt-1">{opp.referenceNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">{opp.type || 'N/A'}</td>
                  <td className="px-6 py-4">{opp.departmentName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${opp.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : opp.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {opp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{opp.applicationDeadline}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/reviewer/opportunities/${opp.opportunityId}/edit`} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#001c3d] font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
