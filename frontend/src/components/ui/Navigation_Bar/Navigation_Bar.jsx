import "./Navigation_Bar.css";
import { useRef, useEffect, useState } from "react";

function Navigation_Bar({ 
  items = [],
  activeItem = "",
  onItemClick,
  user = null
}) {
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const indicatorRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: 'translateX(0px)',
    width: '0px',
    backgroundColor: '#2563eb'
  });
  const [isHoveringActive, setIsHoveringActive] = useState(false);

  useEffect(() => {
    if (listRef.current && itemRefs.current.length > 0) {
      const activeIndex = items.findIndex(item => item.id === activeItem);
      if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
        const activeElement = itemRefs.current[activeIndex];
        const listRect = listRef.current.getBoundingClientRect();
        const itemRect = activeElement.getBoundingClientRect();
        
        const offsetX = itemRect.left - listRect.left - 4; // minus padding
        const itemWidth = itemRect.width;
        
        setIndicatorStyle(prev => ({
          ...prev,
          transform: `translateX(${offsetX}px)`,
          width: `${itemWidth}px`,
          backgroundColor: isHoveringActive ? '#1d4ed8' : '#2563eb'
        }));
      } else {
        // Если нет активной кнопки, скрываем индикатор
        setIndicatorStyle(prev => ({
          ...prev,
          transform: 'translateX(0px)',
          width: '0px',
          backgroundColor: '#2563eb'
        }));
      }
    }
  }, [activeItem, items, isHoveringActive]);

  useEffect(() => {
    if (listRef.current && itemRefs.current.length > 0) {
      const activeIndex = items.findIndex(item => item.id === activeItem);
      if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
        const activeElement = itemRefs.current[activeIndex];
        
        const handleMouseEnter = () => {
          setIsHoveringActive(true);
        };
        
        const handleMouseLeave = () => {
          setIsHoveringActive(false);
        };
        
        activeElement.addEventListener('mouseenter', handleMouseEnter);
        activeElement.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
          activeElement.removeEventListener('mouseenter', handleMouseEnter);
          activeElement.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [activeItem, items]);

  const handleItemClick = (itemId) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  return (
    <nav className="navigation-bar">
      <ul className="nav-list" ref={listRef}>
        {/* ЕДИНАЯ ПЛАШКА ДЛЯ ВСЕГО СПИСКА */}
        <div 
          className="nav-indicator" 
          style={indicatorStyle}
          ref={indicatorRef}
        ></div>
        
        {items.map((item, index) => (
          <li
            key={item.id}
            ref={el => itemRefs.current[index] = el}
            className={`nav-item ${activeItem === item.id ? "active" : ""}`}
            onClick={() => handleItemClick(item.id)}
          >
            {item.icon && <span className="nav-icon">{item.icon}</span>}
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </li>
        ))}
      </ul>

      {user && (
        <div className="user-profile">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation_Bar;