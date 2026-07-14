"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { CenteredSpinner, Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";

export default function EditOpportunity({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    referenceNumber: "",
    type: "",
    departmentId: "",
    status: "",
    applicationDeadline: "",
    requirements: "",
    benefits: "",
    vacancies: 1,
    duration: "",
    location: "",
    workArrangement: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [opp, depts] = await Promise.all([
          api.get(`/api/opportunities/${id}`),
          api.get("/api/departments")
        ]);

        setDepartments(depts || []);
        
        // Format date to YYYY-MM-DD
        let deadline = "";
        if (opp.applicationDeadline) {
          deadline = new Date(opp.applicationDeadline).toISOString().split('T')[0];
        }

        let startDate = "";
        if (opp.startDate) {
          startDate = new Date(opp.startDate).toISOString().split('T')[0];
        }
        
        let endDate = "";
        if (opp.endDate) {
          endDate = new Date(opp.endDate).toISOString().split('T')[0];
        }

        setFormData({
          title: opp.title || "",
          description: opp.description || "",
          referenceNumber: opp.referenceNumber || "",
          type: opp.type || "",
          departmentId: opp.departmentId?.toString() || "",
          status: opp.status || "DRAFT",
          applicationDeadline: deadline,
          requirements: opp.requirements || "",
          benefits: opp.benefits || "",
          vacancies: opp.numberOfSlots || opp.vacancies || 1,
          duration: opp.duration || "",
          location: opp.location || "",
          workArrangement: opp.workArrangement || "",
          startDate: startDate,
          endDate: endDate
        });

      } catch (err: any) {
        setError(err.message || "Failed to load opportunity.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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

      await api.put(`/api/opportunities/${id}`, payload);
      toast.success("Opportunity updated successfully!");
      router.push("/reviewer/opportunities");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to update opportunity.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CenteredSpinner message="Loading opportunity details..." />;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest mb-8">
        <Link href="/reviewer/opportunities" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium w-fit">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Opportunities
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Edit Opportunity</h1>
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
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Reference Number</label>
              <input type="text" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
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
              <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Requirements</label>
              <textarea rows={4} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="List requirements (e.g. continuing student, relevant coursework...)" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Benefits / What you'll learn</label>
              <textarea rows={4} value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y" placeholder="List benefits or learning outcomes..." />
            </div>
          </div>
        </div>

        {/* Logistics */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-primary mb-4 border-b border-surface-container-highest pb-2">Logistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Nairobi HQs" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Work Arrangement</label>
              <select value={formData.workArrangement} onChange={e => setFormData({...formData, workArrangement: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer">
                <option value="">Select Work Arrangement...</option>
                <option value="ON-SITE">On-Site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Duration</label>
              <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. 3 Months" />
            </div>
            <div className="hidden md:block"></div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
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
            {saving ? <Spinner className="border-white" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
