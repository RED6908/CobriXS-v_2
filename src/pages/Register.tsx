import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones básicas
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Usuario registrado correctamente. Revisa tu correo para confirmar tu cuenta."
    );

    setTimeout(() => {
      navigate("/login");
    }, 2500);

    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-primary">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "400px" }}>
        <h1 className="text-center text-primary fw-bold mb-2">Registro</h1>
        <p className="text-center text-muted mb-4">
          Crear una nueva cuenta en CobriXS
        </p>

        <form onSubmit={handleRegister}>
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 small">
              {success}
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
                Registrando...
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small>
            ¿Ya tienes cuenta?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-primary fw-semibold"
              style={{ cursor: "pointer" }}
            >
              Inicia sesión
            </span>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;