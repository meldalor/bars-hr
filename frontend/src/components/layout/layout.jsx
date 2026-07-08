import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Navigation_Bar from "../ui/Navigation_Bar/Navigation_Bar";
import "./layout.css";

import settingsIcon from "../../assets/icons/settings.svg";
import bellIcon from "../../assets/icons/bell.svg";
import chevronIcon from "../../assets/icons/chevron-down.svg";
import logoutIcon from "../../assets/icons/logout.svg";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  // --- ЛОГИКА КНОПКИ "НАВЕРХ" ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="layout-container">
      <div className="app-wrapper">
        
        <header className="header">
          {/* ЛЕВО (Логотип) - теперь кликабельный */}
          <div 
            className="header-logo" 
            onClick={() => navigate("/app/overview")}
            style={{ cursor: "pointer" }}
          >
            Huntly
          </div>

          {/* ПРАВО (ВСЁ ОСТАЛЬНОЕ) */}
          <div className="header-actions">
            
            {/* Навигация */}
            <Navigation_Bar
              items={menuItems}
              activeItem={activeItem}
              onItemClick={handleItemClick}
            />

            {/* Круглая кнопка Настройки */}
            <button className="header-btn" aria-label="Настройки" onClick={() => navigate("/app/admin")}>
              <img src={settingsIcon} alt="Настройки" className="header-btn-icon" />
            </button>

            {/* Круглая кнопка Уведомления */}
            <button className="header-btn" aria-label="Уведомления">
              <img src={bellIcon} alt="Уведомления" className="header-btn-icon" />
            </button>

            {/* Профиль */}
            <div className="profile-container" ref={profileRef}>
              <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <img 
                  src="https://i.pinimg.com/736x/64/ea/92/64ea92c0a30a561961ad6af3dd34ecfd.jpg"
                  alt="Петрова Арина" 
                  className="user-avatar"
                />
                <div className="user-info">
                  <span className="user-name">Петрова Арина</span>
                  <span className="user-role">HR-менеджер</span>
                </div>
                <img 
                  src={chevronIcon} 
                  alt="Стрелка" 
                  className={`user-arrow ${isProfileOpen ? 'rotated' : ''}`} 
                />
              </div>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={handleLogout}>
                    <img src={logoutIcon} alt="Выйти" className="dropdown-item-icon" />
                    Выйти
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        {/* --- КНОПКА "НАВЕРХ" (ПОЯВЛЯЕТСЯ ПРИ СКРОЛЛЕ) --- */}
        {showScrollButton && (
          <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Наверх">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
}

export default Layout;