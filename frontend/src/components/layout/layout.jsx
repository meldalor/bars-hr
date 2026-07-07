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
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      backgroundColor: "#f1f1f1",
      position: "relative"
    }}>

      <div style={{
        position: "absolute",
        top: "20px",
        left: "40px",
        zIndex: 1000,
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
        right: "360px",
        width: "auto",
        zIndex: 1000
      }}>
        <Navigation_Bar
          items={menuItems}
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
      </div>

      <main style={{ 
        flex: 1, 
        padding: "100px 40px 40px", 
        overflow: "auto",
        backgroundColor: "#f1f1f1"
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;