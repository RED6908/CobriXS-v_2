import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import type { FC } from "react";

type Language = "es" | "en";
type FontSize = "sm" | "md" | "lg";

const Settings: FC = () => {
  const { language, fontSize, setLanguage, setFontSize, t } = useSettings();

  return (
    <div className="container-fluid settings-page">
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{t.settings}</li>
        </ol>
      </nav>
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">{t.settings}</h3>
        <p className="text-muted mb-0">
          {language === "es"
            ? "Personaliza la experiencia del sistema"
            : "Customize the system experience"}
        </p>
      </div>

      <div className="row g-4">
        {/* Accessibility */}
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold mb-4">
                <i className="bi bi-universal-access me-2" />
                {t.accessibility}
              </h5>

              {/* ===== Language ===== */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  {t.language}
                </label>

                <div className="d-flex gap-2">
                  {(["es", "en"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`btn ${
                        language === lang
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setLanguage(lang)}
                    >
                      {lang === "es"
                        ? "🇲🇽 Español"
                        : "🇺🇸 English"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== Font Size ===== */}
              <div>
                <label className="form-label fw-semibold">
                  {t.fontSize}
                </label>

                <div className="d-flex gap-2">
                  {(["sm", "md", "lg"] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`btn ${
                        fontSize === size
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      } font-size-preview-${size}`}
                      onClick={() => setFontSize(size)}
                      {...(fontSize === size && { "aria-pressed": "true" })}
                    >
                      {size === "sm"
                        ? t.fontSmall
                        : size === "md"
                        ? t.fontMedium
                        : t.fontLarge}
                    </button>
                  ))}
                </div>

                <div className={`mt-3 p-3 bg-light rounded settings-preview font-size-preview-${fontSize}`}>
                  <p className="mb-0">
                    {language === "es"
                      ? "Vista previa del texto con el tamaño seleccionado."
                      : "Preview text with selected size."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== About ===== */}
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold mb-4">
                <i className="bi bi-info-circle me-2" />
                {language === "es"
                  ? "Acerca del sistema"
                  : "About the system"}
              </h5>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center settings-about-icon"
                  aria-hidden
                >
                  <i className="bi bi-shop text-white fs-4" />
                </div>
                <div>
                  <div className="fw-bold fs-5">CobriXS</div>
                  <div className="text-muted">
                    {language === "es"
                      ? "Sistema POS Profesional"
                      : "Professional POS System"}
                  </div>
                </div>
              </div>

              <ul className="list-unstyled text-muted small">
                <li className="mb-1">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  {language === "es"
                    ? "Gestión de inventario en tiempo real"
                    : "Real-time inventory management"}
                </li>
                <li className="mb-1">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  {language === "es"
                    ? "Pagos a proveedores con descuento automático"
                    : "Supplier payments with automatic discounts"}
                </li>
                <li className="mb-1">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  {language === "es"
                    ? "Reportes y cortes de caja"
                    : "Reports and cash register closures"}
                </li>
                <li className="mb-1">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  {language === "es"
                    ? "Múltiples métodos de pago"
                    : "Multiple payment methods"}
                </li>
                <li>
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  {language === "es"
                    ? "Compatible con dispositivos móviles"
                    : "Mobile device compatible"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;