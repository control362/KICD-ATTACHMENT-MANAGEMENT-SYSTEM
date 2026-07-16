"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { CenteredSpinner, Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function StaffManagement() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    email: "", 
    roleId: "", 
    password: "", 
    isActive: true 
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/roles")
      ]);
      setStaffList(usersData || []);
      setRoles(rolesData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/reviewer/dashboard");
      return;
    }
    loadData();
  }, [user, isAdmin, router]);

  const openModal = (mode: "create" | "edit", userObj?: any) => {
    setModalMode(mode);
    setCurrentUser(userObj || null);
    setFormData({
      email: userObj?.email || "",
      roleId: userObj?.role?.roleId?.toString() || "",
      password: "", // Password is blank on edit unless they want to change it
      isActive: userObj ? userObj.isActive : true
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
    
    // For create, password is required
    if (modalMode === "create" && (!formData.password || formData.password.length < 8)) {
      setFormError("Password must be at least 8 characters");
      setFormLoading(false);
      return;
    }

    // Prepare payload
    const payload: any = {
      email: formData.email,
      roleId: Number(formData.roleId),
      isActive: formData.isActive
    };

    if (formData.password) {
      payload.password = formData.password;
    }
    
    try {
      if (modalMode === "create") {
        await api.post("/api/users", payload);
      } else if (currentUser) {
        await api.put(`/api/users/${currentUser.userId}`, payload);
      }
      closeModal();
      loadData();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/api/users/${deleteUserId}`);
      toast.success("User deleted successfully.");
      loadData();
    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete user.");
    } finally {
      setDeleteUserId(null);
    }
  };

  if (!isAdmin && !loading) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Staff Management</h2>
          <p className="text-lg text-on-surface-variant mt-1">Manage system access for Reviewers and Admins</p>
        </div>
        <button 
          onClick={() => openModal("create")}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span> Add Staff
        </button>
      </header>

      {/* Data Table */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container-highest flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white">
          <h3 className="text-xl font-bold text-primary tracking-tight">System Users</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search staff by email or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-72 text-sm font-medium"
            />
          </div>
        </div>
        <div className="bg-surface-container-lowest min-h-[300px]">
          {loading ? (
             <CenteredSpinner message="Loading staff…" />
          ) : error ? (
            <p className="text-danger text-sm py-8 text-center">{error}</p>
          ) : staffList.length === 0 ? (
            <div className="py-16 text-center">
              <h4 className="text-lg font-bold text-on-surface mb-1">No Staff Found</h4>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-highest text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-6 font-semibold">User ID</th>
                    <th className="py-4 px-6 font-semibold">Email</th>
                    <th className="py-4 px-6 font-semibold">Role</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {(() => {
                    const filteredStaff = staffList.filter(u => 
                      !searchQuery || 
                      u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (u.role?.roleName || '').toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    if (filteredStaff.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-on-surface-variant font-medium">No staff members match your search criteria.</td>
                        </tr>
                      );
                    }

                    return filteredStaff.map((u) => (
                      <tr key={u.userId} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-6 text-on-surface-variant font-medium">{u.userId}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0 shadow-sm text-xs">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant font-medium">
                          <span className="px-2 py-1 bg-surface-container rounded text-xs font-bold uppercase tracking-wider">{u.role?.roleName?.replace('ROLE_', '') || "—"}</span>
                        </td>
                        <td className="py-4 px-6">
                          {u.isActive ? (
                             <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">Active</span>
                          ) : (
                             <span className="px-3 py-1 bg-danger-container text-danger text-xs font-bold rounded-full">Suspended</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openModal("edit", u)} className="p-2 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => setDeleteUserId(u.userId)} className="p-2 rounded-lg text-danger hover:bg-danger-container transition-colors">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
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
              <h3 className="text-xl font-bold text-primary">{modalMode === "create" ? "Add Staff Member" : "Edit Staff Member"}</h3>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Role</label>
                <select 
                  required 
                  value={formData.roleId}
                  onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow cursor-pointer"
                >
                  <option value="" disabled>Select a role...</option>
                  {roles.map(r => (
                    <option key={r.roleId} value={r.roleId}>{r.roleName.replace('ROLE_', '')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  {modalMode === "create" ? "Initial Password" : "New Password (Optional)"}
                </label>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  required={modalMode === "create"} 
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-4 py-3 border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow" 
                />
                {modalMode === "edit" && (
                   <p className="text-xs text-on-surface-variant mt-1">Leave blank to keep the current password.</p>
                )}
              </div>

              {modalMode === "edit" && (
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-on-surface">Account is Active</label>
                </div>
              )}
              
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
        isOpen={!!deleteUserId}
        title="Delete Staff Member"
        message="Are you sure you want to completely delete this user? (Usually it is safer to just mark them as inactive.)"
        confirmText="Delete User"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
}
