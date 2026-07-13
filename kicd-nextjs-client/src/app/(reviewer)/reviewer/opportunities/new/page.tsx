"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";

export default function NewOpportunity() {
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    referenceNumber: "",
    type: "",
    departmentId: "",
    status: "DRAFT",
    applicationDeadline: "",
    requirements: "",
    responsibilities: "",
    vacancies: 1
  });

  useEffect(() => {
    async function loadData() {
      try {
        const depts = await api.get("/api/departments");
        setDepartments(depts || []);
      } catch (err: any) {
        setError(err.message || "Failed to load departments.");
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        numberOfSlots: Number(formData.vacancies)
      };

      await api.post(`/api/opportunities`, payload);
      toast.success("Opportunity created successfully!");
      router.push("/reviewer/opportunities");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to create opportunity.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest mb-8">
        <Link href="/reviewer/opportunities" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium w-fit">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Opportunities
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Post New Opportunity</h1>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-danger-container border border-danger/20 text-danger rounded-xl shadow-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Core Info */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 border-b border-surface-container-highest pb-2">Core Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Title <span className="text-danger">*</span></label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. IT Attachment Cohort 2026" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Reference Number</label>
              <input type="text" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. IT-ATT-001" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Type <span className="text-danger">*</span></label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer">
                <option value="" disabled>Select Type...</option>
                <option value="ATTACHMENT">Industrial Attachment</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Department <span className="text-danger">*</span></label>
              <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer">
                <option value="" disabled>Select Department...</option>
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Vacancies <span className="text-danger">*</span></label>
              <input required type="number" min="1" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value) || 1})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-primary mb-4 border-b border-surface-container-highest pb-2">Description & Requirements</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Description <span className="text-danger">*</span></label>
              <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="Briefly describe the opportunity..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Requirements</label>
              <textarea rows={4} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="List requirements (e.g. continuing student, relevant coursework...)" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Responsibilities</label>
              <textarea rows={4} value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="List daily tasks..." />
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-primary mb-4 border-b border-surface-container-highest pb-2">Publishing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Status <span className="text-danger">*</span></label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer font-bold">
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="PUBLISHED" className="text-success">PUBLISHED (Visible)</option>
                <option value="CLOSED" className="text-danger">CLOSED (Archived)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Application Deadline <span className="text-danger">*</span></label>
              <input required type="date" value={formData.applicationDeadline} onChange={e => setFormData({...formData, applicationDeadline: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-container-highest flex justify-end gap-4">
          <Link href="/reviewer/opportunities" className="px-6 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px] shadow-sm">
            {saving ? <Spinner className="border-white" /> : "Post Opportunity"}
          </button>
        </div>
      </form>
    </div>
  );
}
