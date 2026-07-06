import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <h2>платформа для HR-специалиста</h2>

        <nav style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <NavLink to="/overview">обзор</NavLink>
          <NavLink to="/vacancies">вакансии</NavLink>
          <NavLink to="/candidates">кандидаты</NavLink>
          <NavLink to="/meetings">встречи</NavLink>
        </nav>
      </header>

      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;