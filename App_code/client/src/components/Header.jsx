import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();

  const handleLogoutClick = () => {
    if (onLogout) {
        onLogout();
    }
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
        <Link 
          to="/account" 
          className={`nav-link ${location.pathname === '/account' ? 'active' : ''}`}
        >
          Личный кабинет
        </Link>
        <Link 
          to="/catalog" 
          className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
        >
          Поиск
        </Link>
      </div>
      {user ? (
        <div className="user-info">
          <span className="user-name">{user.full_name}</span>
          <div className="user-avatar">
            {user.first_name.split(' ').map(n => n[0]).join('')}
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