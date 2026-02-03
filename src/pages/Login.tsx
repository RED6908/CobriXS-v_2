import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("Usuario autenticado:", data.user);
      // Aquí puedes redirigir al dashboard
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-primary">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h1 className="text-center text-primary fw-bold mb-2">CobriXS</h1>
        <p className="text-center text-muted mb-4">
          Sistema de Punto de Venta Profesional
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="usuario@cobrixs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger small mb-3">{error}</p>}

          <button type="submit" className="btn btn-primary w-100">
            Iniciar sesión
          </button>
        </form>

        {/* Caja de usuarios de prueba */}
        <div className="mt-4 bg-light p-3 rounded">
          <h6 className="fw-semibold mb-2">Usuarios de prueba:</h6>
          <ul className="list-unstyled small text-muted">
            <li>
              Administrador: <strong>admin@cobrixs.com</strong>
            </li>
            <li>
              Vendedor: <strong>maria@cobrixs.com</strong>
            </li>
            <li>
              Usuario: <strong>juan@cobrixs.com</strong>
            </li>
            <li>
              Contraseña: <strong>123456</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;