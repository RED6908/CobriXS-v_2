import { useEffect, useState, useCallback } from "react";
import {
  getUsers,
  createUserProfile,
  updateUserRole,
  updateUserName,
  deleteUserProfile,
} from "../services/users.service";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import PageHeader from "../components/PageHeader";
import type { UserProfile } from "../types/database";

export default function Users() {
  const { success: toastSuccess, error: toastError } = useToast();
  const { session } = useAuth();
  const currentUserId = session?.user?.id;
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "vendedor" as "admin" | "vendedor",
  });

  const loadUsers = useCallback(async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    if (!form.email.trim()) {
      setFormError("El correo es obligatorio");
      return;
    }
    if (form.password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("No se pudo crear el usuario");
      await createUserProfile(data.user.id, form.name.trim(), form.role);
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "vendedor" });
      toastSuccess("Usuario creado correctamente");
      await loadUsers();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al crear usuario");
      toastError(e instanceof Error ? e.message : "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setForm({ ...form, name: user.name, role: user.role });
    setFormError(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      await updateUserName(editingUser.user_id, form.name.trim());
      await updateUserRole(editingUser.user_id, form.role);
      setShowEditModal(false);
      setEditingUser(null);
      toastSuccess("Usuario actualizado correctamente");
      await loadUsers();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error al actualizar");
      toastError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.user_id === currentUserId) {
      toastError("No puedes eliminar tu propia cuenta");
      return;
    }
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setSaving(true);
    try {
      await deleteUserProfile(user.user_id);
      toastSuccess("Usuario eliminado correctamente");
      await loadUsers();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchName = user.name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    return matchName && matchRole;
  });

  if (loading) {
    return (
      <div className="container-fluid">
        <PageHeader
          title="Gestión de Usuarios"
          subtitle="Administrar cuentas y permisos"
          breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Usuarios" }]}
        />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3 text-muted">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administrar cuentas de usuario y permisos"
        breadcrumb={[{ label: "Inicio", to: "/" }, { label: "Usuarios" }]}
      />

      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm({ name: "", email: "", password: "", role: "vendedor" });
            setFormError(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-1" />
          Nuevo Usuario
        </button>
      </div>

      <div className="cobrixs-card mb-4">
        <div className="cobrixs-card-body">
          <h6 className="fw-semibold mb-3">
            <i className="bi bi-funnel me-2" />
            Filtros
          </h6>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar por nombre"
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filtrar por rol"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cobrixs-card">
        <div className="cobrixs-card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-people me-2" />
            Lista de Usuarios
          </span>
          <span className="badge bg-light text-dark">{filteredUsers.length} usuarios</span>
        </div>
        <div className="table-responsive">
          <table className="table table-professional align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Fecha de ingreso</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="fw-semibold">{user.name ?? "Sin nombre"}</td>
                  <td>
                    {user.role === "admin" && (
                      <span className="badge bg-danger bg-opacity-10 text-danger">Administrador</span>
                    )}
                    {user.role === "vendedor" && (
                      <span className="badge bg-primary bg-opacity-10 text-primary">Vendedor</span>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString("es-MX")}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => handleEditUser(user)}
                      aria-label="Editar"
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(user)}
                      disabled={user.user_id === currentUserId}
                      aria-label="Eliminar"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2 mb-3">{formError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre completo"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      aria-label="Nombre"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo electrónico *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="usuario@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      aria-label="Correo"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      minLength={6}
                      aria-label="Contraseña"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value as "admin" | "vendedor" }))
                      }
                      aria-label="Rol"
                    >
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Creando..." : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                />
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2 mb-3">{formError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nombre completo"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      aria-label="Nombre"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value as "admin" | "vendedor" }))
                      }
                      aria-label="Rol"
                    >
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
