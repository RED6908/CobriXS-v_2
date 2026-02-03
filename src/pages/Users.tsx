export default function Users() {
  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 className="fw-bold mb-1">Gestión de Usuarios</h3>
          <p className="text-muted mb-0">
            Administrar cuentas de usuario y permisos
          </p>
        </div>

        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            <i className="bi bi-person me-2" />
            Lista de Usuarios
          </h6>

          <table className="table align-middle">
            <thead>
              <tr className="text-muted">
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold">Administrador</td>
                <td>admin@cobrixs.com</td>
                <td>
                  <span className="badge bg-danger-subtle text-danger">
                    Admin
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-2">
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="btn btn-light btn-sm text-danger">
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>

              <tr>
                <td className="fw-semibold">María García</td>
                <td>maria@cobrixs.com</td>
                <td>
                  <span className="badge bg-primary-subtle text-primary">
                    Vendedor
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-2">
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="btn btn-light btn-sm text-danger">
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>

              <tr>
                <td className="fw-semibold">Juan López</td>
                <td>juan@cobrixs.com</td>
                <td>
                  <span className="badge bg-success-subtle text-success">
                    Usuario
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-2">
                    <i className="bi bi-pencil" />
                  </button>
                  <button className="btn btn-light btn-sm text-danger">
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
