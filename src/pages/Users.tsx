import { useEffect, useState } from "react";
import { getUsers } from "../services/users.service";
import type { UserProfile } from "../types/database";

export default function Users() {

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <>
      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 className="fw-bold mb-1">Gestión de Usuarios</h3>
          <p className="text-muted mb-0">
            Administrar cuentas de usuario y permisos
          </p>
        </div>

        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"/>
          Nuevo Usuario
        </button>
      </div>

      {/* FILTROS */}

      <div className="card shadow-sm mb-4">
        <div className="card-body">

          <h6 className="fw-semibold mb-3">
            <i className="bi bi-funnel me-2"/>
            Filtros de búsqueda
          </h6>

          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="form-control"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e)=>setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-light w-100"
                onClick={()=>{
                  setSearch("");
                  setRoleFilter("all");
                }}
              >
                Limpiar filtros
              </button>
            </div>

          </div>

        </div>
      </div>

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
                        Vendedor
                      </span>
                    )}

                  </td>

                  <td>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="text-end">

                    <button className="btn btn-light btn-sm me-2">
                      <i className="bi bi-pencil"/>
                    </button>

                    <button className="btn btn-light btn-sm text-danger">
                      <i className="bi bi-trash"/>
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}