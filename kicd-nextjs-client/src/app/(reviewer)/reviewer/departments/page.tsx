"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CenteredSpinner, Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  const [deleteDeptId, setDeleteDeptId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentDept, setCurrentDept] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/departments");
      setDepartments(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const openModal = (mode: "create" | "edit", dept?: any) => {
    setModalMode(mode);
    setCurrentDept(dept || null);
    setFormData({
      name: dept?.name || "",
      code: dept?.code || ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    
    try {
      if (modalMode === "create") {
        await api.post("/api/departments", formData);
      } else if (currentDept) {
        await api.put(`/api/departments/${currentDept.departmentId}`, formData);
      }
      closeModal();
      loadDepartments();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteDeptId) return;
    try {
      await api.delete(`/api/departments/${deleteDeptId}`);
      toast.success("Department deleted successfully.");
      loadDepartments();
    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete department.");
    } finally {
      setDeleteDeptId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Departments Management</h2>
          <p className="text-lg text-on-surface-variant mt-1">Manage KICD departments available for attachment</p>
        </div>
        <button 
          onClick={() => openModal("create")}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> Add Department
        </button>
      </header>

      {/* Data Table */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center bg-white">
          <h3 className="text-xl font-bold text-primary tracking-tight">Department List</h3>
        </div>
        <div className="bg-surface-container-lowest min-h-[300px]">
          {loading ? (
             <CenteredSpinner message="Loading departments…" />
          ) : error ? (
            <p className="text-danger text-sm py-8 text-center">{error}</p>
          ) : departments.length === 0 ? (
            <div className="py-16 text-center">
              <h4 className="text-lg font-bold text-on-surface mb-1">No Departments Found</h4>
              <p className="text-on-surface-variant text-sm">Add a new department to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-6 font-semibold">ID</th>
                    <th className="py-4 px-6 font-semibold">Department Name</th>
                    <th className="py-4 px-6 font-semibold">Code</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {departments.map((d) => (
                    <tr key={d.departmentId} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-6 text-on-surface-variant font-medium">{d.departmentId}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{d.name}</p>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant font-medium">{d.code || "—"}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal("edit", d)} className="px-3 py-2 flex items-center gap-1 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-white transition-colors text-sm font-semibold">
                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                          </button>
                          <button onClick={() => setDeleteDeptId(d.departmentId)} className="px-3 py-2 flex items-center gap-1 rounded-lg text-danger hover:bg-danger-container transition-colors text-sm font-semibold">
                            <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ width: '100%', maxWidth: '450px' }}>
            <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary">{modalMode === "create" ? "Add Department" : "Edit Department"}</h3>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Department Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Department Code (Optional)</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow" 
                />
              </div>
              
              {formError && (
                <div className="p-3 bg-danger-container text-danger text-sm rounded-lg">
                  {formError}
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-outline-variant rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-highest transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-colors disabled:opacity-50 flex justify-center items-center">
                  {formLoading ? <Spinner className="w-5 h-5 border-white" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteDeptId}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete Department"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteDeptId(null)}
      />
    </div>
  );
}
