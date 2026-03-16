import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  getUsers,
  createUserProfile,
  updateUserName,
  updateUserRole,
  deleteUserProfile,
} from "../services/users.service";
import type { UserProfile } from "../types/database";


export default function Users() {

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "vendedor">("vendedor");
  const [newEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "vendedor">("vendedor");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {

    const matchName =
      user.name?.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchName && matchRole;

  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newEmail.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }
    if (!newPassword) {
      setError("La contraseña es obligatoria.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const email = newEmail.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: newPassword,
      });
      if (signUpError) throw signUpError;
      const user = data.user;
      if (!user) throw new Error("No se pudo crear el usuario");
      await createUserProfile(user.id, newName.trim() || newEmail, newRole);
      setSuccess("Usuario creado correctamente");
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewPhone("");
      setNewRole("vendedor");
      loadUsers();
      setTimeout(() => {
        setShowModal(false);
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario";
      const is422 =
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        (err as { status?: number }).status === 422;
      const isDuplicate =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("already registered") ||
          msg.toLowerCase().includes("already exists"));
      if (is422 || isDuplicate) {
        setError("Este correo ya está registrado. Usa otro o edita el usuario existente.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.name ?? "");
    setEditRole(user.role);
    setError(null);
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSaving(true);
    try {
      await updateUserName(editingUser.user_id, editName.trim() || "Sin nombre");
      await updateUserRole(editingUser.user_id, editRole);
      loadUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`¿Eliminar a ${user.name ?? "este usuario"}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      await deleteUserProfile(user.user_id);
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    }
  };

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  const formatEntryDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="users-page">
      {/* BREADCRUMB */}
      <nav className="text-muted small mb-2" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><span>Usuarios</span></li>
          <li className="breadcrumb-item active" aria-current="page">Escritorio</li>
        </ol>
      </nav>

      {/* FILTROS PRIMERO: para empezar a filtrar y ver usuarios */}
      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3">
            <span className="text-muted">
              <i className="bi bi-funnel me-2"/>
              Buscar
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="form-control filter-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar por nombre"
            />
            <select
              className="form-select filter-role-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filtrar por rol"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Cajero</option>
            </select>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h3 className="fw-bold mb-0">Gestión de Usuarios</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"/>
          Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          {error}
          <button
            type="button"
            className="btn-close btn-sm ms-2"
            aria-label="Cerrar"
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* TABLA */}

      <div className="card shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between mb-3">

            <h6 className="fw-semibold">
              <i className="bi bi-person me-2"/>
              Lista de Usuarios
            </h6>

            <span className="badge bg-light text-dark">
              {filteredUsers.length} usuarios
            </span>

          </div>

          <table className="table align-middle">

            <thead>
              <tr className="text-muted">
                <th>Nombre</th>
                <th>Rol</th>
                <th>Fecha de ingreso</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((user)=>(
                <tr key={user.id}>

                  <td className="fw-semibold">
                    {user.name ?? "Sin nombre"}
                  </td>

                  <td>

                    {user.role === "admin" && (
                      <span className="badge bg-danger-subtle text-danger">
                        Administrador
                      </span>
                    )}

                    {user.role === "vendedor" && (
                      <span className="badge bg-primary-subtle text-primary">
                        Cajero
                      </span>
                    )}

                  </td>

                  <td>
                    {formatEntryDate(user.created_at)}
                  </td>

                  <td className="text-end">

                    <button
                      type="button"
                      className="btn btn-light btn-sm me-2"
                      onClick={() => openEditModal(user)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"/>
                    </button>

                    <button
                      type="button"
                      className="btn btn-light btn-sm text-danger"
                      onClick={() => handleDeleteUser(user)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"/>
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL NUEVO USUARIO */}

      {showModal && (
        <div className="modal fade show d-block users-modal-overlay" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content p-4 position-relative">
              <button
                type="button"
                className="btn btn-link position-absolute top-0 end-0 p-2 text-dark text-decoration-none modal-close-btn"
                aria-label="Cerrar"
                onClick={() => { setShowModal(false); setError(null); setSuccess(null); setNewPhone(""); }}
              >
                <i className="bi bi-x-lg" />
              </button>
              <h5 className="mb-4 pe-4">Nuevo Usuario</h5>
              <form onSubmit={handleCreateUser} noValidate>
                <div className="mb-3">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre completo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Correo electrónico"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    aria-required="true"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="555-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="new-user-role">Rol</label>
                  <select
                    id="new-user-role"
                    className="form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "admin" | "vendedor")}
                    aria-label="Rol del nuevo usuario"
                  >
                    <option value="vendedor">Cajero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="new-entry-date">Fecha de ingreso</label>
                  <input
                    id="new-entry-date"
                    type="date"
                    className="form-control readonly-date"
                    value={newEntryDate}
                    readOnly
                    aria-label="Fecha de ingreso"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-required="true"
                  />
                </div>
                {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button type="button" className="btn btn-light" onClick={() => { setShowModal(false); setError(null); setSuccess(null); setNewPhone(""); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Creando..." : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}

      {showEditModal && editingUser && (
        <div className="modal fade show d-block users-modal-overlay" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content p-4 position-relative">
              <button
                type="button"
                className="btn btn-link position-absolute top-0 end-0 p-2 text-dark text-decoration-none modal-close-btn"
                aria-label="Cerrar"
                onClick={() => { setShowEditModal(false); setEditingUser(null); setError(null); }}
              >
                <i className="bi bi-x-lg" />
              </button>
              <h5 className="mb-4 pe-4">Editar Usuario</h5>
              <form onSubmit={handleEditUser}>
                <div className="mb-3">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre completo"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="edit-user-role">Rol</label>
                  <select
                    id="edit-user-role"
                    className="form-select"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "admin" | "vendedor")}
                    aria-label="Rol del usuario"
                  >
                    <option value="vendedor">Cajero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button type="button" className="btn btn-light" onClick={() => { setShowEditModal(false); setEditingUser(null); setError(null); }}>
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