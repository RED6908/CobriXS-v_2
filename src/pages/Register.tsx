import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Usuario registrado correctamente. Revisa tu correo para confirmar.");
      setTimeout(() => navigate("/login"), 2000);
    }
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

          <div className="mb-3">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger small mb-3">{error}</p>}
          {success && <p className="text-success small mb-3">{success}</p>}

          <button type="submit" className="btn btn-primary w-100">
            Registrarse
          </button>
        </form>

        <div className="mt-3 text-center">
          <small>
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-primary fw-semibold">
              Inicia sesión
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;