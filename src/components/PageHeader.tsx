import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
}

export default function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            {breadcrumb.map((item, i) => (
              <li
                key={i}
                className={`breadcrumb-item ${i === breadcrumb.length - 1 ? "active" : ""}`}
                aria-current={i === breadcrumb.length - 1 ? "page" : undefined}
              >
                {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1>{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
}
