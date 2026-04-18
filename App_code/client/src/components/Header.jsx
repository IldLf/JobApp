import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const getInitials = () => {
    if (!user) return '';
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.full_name && user.full_name !== ' ') {
      return user.full_name;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split('@')[0];
  };

  return (
      <header className="header">
        <div className="logo">JOB BOARD</div>
        <div className="nav-links">
          <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Главная
          </Link>
          {user?.user_type !== 'admin' && (
              <Link
                  to="/account"
                  className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}
              >
                Личный кабинет
              </Link>
          )}
          <Link
              to="/catalog"
              className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
          >
            Поиск
          </Link>
          {user?.user_type === 'admin' && (
              <Link
                  to="/admin"
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Модерация
              </Link>
          )}
        </div>
        {user ? (
            <div className="user-info">
              <span className="user-name">{getDisplayName()}</span>
              <div className="user-avatar">
                {getInitials()}
              </div>
              <button className="nav-link btn-outline" onClick={handleLogoutClick}>Выйти</button>
            </div>
        ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link btn-outline">Войти</Link>
              <Link to="/login" className="nav-link btn-outline">Регистрация</Link>
            </div>
        )}
      </header>
  );
};

export default Header;