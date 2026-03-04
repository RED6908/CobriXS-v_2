import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================================
     VERIFICAR SESIÓN ACTIVA
  ================================= */

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  /* ================================
     LOGIN
  ================================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    if (data.user) {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  /* ================================
     RENDER
  ================================= */

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        {/* Usuarios de prueba */}
        <div className="mt-4 bg-light p-3 rounded">
          <h6 className="fw-semibold mb-2">Usuarios de prueba:</h6>
          <ul className="list-unstyled small text-muted mb-0">
            <li>
              Admin: <strong>admin@cobrixs.com</strong>
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