export default function AppLayout({ children }) {
  return (
    <div className="d-flex vh-100 overflow-hidden">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main className="flex-grow-1 overflow-auto p-4 bg-light">
        {children}
      </main>
    </div>
  );
}
