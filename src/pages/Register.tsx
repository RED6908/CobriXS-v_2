import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("vendedor");

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
      .insert({
        user_id: user.id,
        role: role,
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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-primary">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "400px" }}>
        <h1 className="text-center text-primary fw-bold mb-2">Registro</h1>

        <p className="text-center text-muted mb-4">
          Crear cuenta en CobriXS
        </p>

        <form onSubmit={handleRegister}>

          {/* EMAIL */}

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

          {/* PASSWORD */}

          <div className="mb-3">
            <label className="form-label">Contraseña</label>

            <input
              type="password"
              className="form-control"
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
              className="form-control"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* ROLE */}

          <div className="mb-3">
            <label className="form-label">Tipo de usuario</label>

            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
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