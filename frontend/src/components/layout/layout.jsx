import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navigation_Bar from "../ui/Navigation_Bar/Navigation_Bar";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "overview", label: "Обзор" },
    { id: "vacancies", label: "Вакансии" },
    { id: "candidates", label: "Кандидаты" },
    { id: "meetings", label: "Встречи" },
  ];

  const pathSegments = location.pathname.split('/');
  const activeItem = pathSegments[2] || "overview";

  const handleItemClick = (itemId) => {
    navigate(`/app/${itemId}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f1f1"
    }}>

      <div style={{
        position: "relative",
        height: "80px"
      }}>

        <div style={{
          position: "absolute",
          top: "20px",
          left: "40px",
          fontSize: "24px",
          fontWeight: "700",
          color: "#1a1a1a",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          height: "40px"
        }}>
          Huntly
        </div>

        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          width: "auto"
        }}>
          <Navigation_Bar
            items={menuItems}
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
        </div>
      </div>

      <main style={{
        padding: "20px 40px 40px",
        backgroundColor: "#f1f1f1"
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
