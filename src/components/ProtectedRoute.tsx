import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Props {
  children: React.ReactNode;
  role?: string;
}

export default function ProtectedRoute({ children, role }: Props) {

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {

    const checkAuth = async () => {

      try {

        // Obtener sesión actual
        const { data: sessionData } = await supabase.auth.getSession();

        const session = sessionData.session;

        // ❌ No hay sesión
        if (!session) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const user = session.user;

        // ✅ Si no se requiere rol → solo login
        if (!role) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Buscar perfil del usuario
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !profile) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // Validar rol
        if (profile.role === role) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }

        setLoading(false);

      } catch (err) {

        console.error("Error verificando sesión:", err);
        setAuthorized(false);
        setLoading(false);

      }

    };

    checkAuth();

  }, [role]);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // ❌ No autorizado → login
  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Autorizado
  return <>{children}</>;
}