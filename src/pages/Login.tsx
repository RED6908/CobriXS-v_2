import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {

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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-primary">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>

        <h1 className="text-center text-primary fw-bold mb-2">
          CobriXS
        </h1>

        <p className="text-center text-muted mb-4">
          Sistema de Punto de Venta
        </p>

        <form onSubmit={handleLogin}>

          <div className="mb-3">
            <label className="form-label">Correo</label>

            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >

            {loading ? "Ingresando..." : "Iniciar sesión"}

          </button>

        </form>

      </div>
    </div>
  );

};

export default Login;