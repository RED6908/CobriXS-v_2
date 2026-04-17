import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     VERIFICAR SESIÓN ACTIVA
  =============================== */

  useEffect(() => {

    const checkSession = async () => {

      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/");
      }

    };

    checkSession();

  }, [navigate]);

  /* ===============================
     LOGIN
  =============================== */

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    /* ===============================
       OBTENER ROL DEL USUARIO
    =============================== */

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user?.id)
      .single();

    if (!profile) {
      setError("No se encontró el perfil del usuario");
      setLoading(false);
      return;
    }

    /* ===============================
       REDIRECCIÓN POR ROL
    =============================== */

    if (profile.role === "admin") {
      navigate("/");
    } else {
      navigate("/");
    }

    setLoading(false);

  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-shop" />
        </div>
        <h1>CobriXS</h1>
        <p className="auth-subtitle">Sistema de Punto de Venta Profesional</p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" aria-hidden />
                Ingresando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="fw-semibold">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}