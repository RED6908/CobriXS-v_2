import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Register() {
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

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    /* ============================
       CREAR USUARIO EN AUTH
    ============================ */

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("No se pudo crear el usuario");
      setLoading(false);
      return;
    }

    /* ============================
       GUARDAR ROL EN user_profiles
    ============================ */

    const { error: profileError } = await supabase
      .from("user_profiles")
      /*.insert({
        user_id: user.id,
        role: role,*///salia error cuando hice las puebas fecha 22/03/26
        .insert({
         user_id: user.id,
        role: "user",
      });

    if (profileError) {
      setError("Usuario creado pero no se pudo asignar rol");
      setLoading(false);
      return;
    }

    setSuccess("Usuario registrado correctamente");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-person-plus" />
        </div>
        <h1>Registro</h1>
        <p className="auth-subtitle">Crear cuenta en CobriXS</p>

        <form onSubmit={handleRegister}>

          {/* EMAIL */}

          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>

            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="usuario@cobrixs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="mb-3">
            <label className="form-label">Contraseña</label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="mb-3">
            <label className="form-label">Confirmar contraseña</label>

            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="alert alert-danger py-2 small">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="alert alert-success py-2 small">
              {success}
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
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

        <div className="mt-4 text-center">
          <small className="text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="fw-semibold">Inicia sesión</Link>
          </small>
        </div>
      </div>
    </div>
  );
}