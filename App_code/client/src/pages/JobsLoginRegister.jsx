import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/JobsLoginRegister.css';

const JobsLoginRegister = ({ onLoginSuccess, onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [userType, setUserType] = useState('applicant');
  const [message, setMessage] = useState({ text: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);

  const showMessage = (text, type) => {
    setMessage({ text, type, visible: true });
    setTimeout(() => {
      setMessage({ text: '', type: '', visible: false });
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      showMessage('Пожалуйста, заполните все поля', 'error');
      return;
    }

    setLoading(true);

    const result = await authService.login(email, password);
    if (result.success) {
      showMessage('Вход выполнен успешно!', 'success');
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
        setTimeout(() => {
          navigate('/'); 
        }, 1000);
      }
    } 
    else {
      showMessage(result.error || 'Неверный email или пароль', 'error');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = registerData;
    const full_name = name.trim().split(' ')

    if (!name || !email || !password || !confirmPassword) {
      showMessage('Пожалуйста, заполните все поля', 'error');
      return;
    }

    if (password.length < 8) {
      showMessage('Пароль должен содержать минимум 8 символов', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Пароли не совпадают', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showMessage('Введите корректный email', 'error');
      return;
    }

    setLoading(true);
    showMessage('Регистрация...', 'info');

    const userData = {
          email: email,
          password: password,
          first_name: full_name[0],         
          last_name: full_name[1],          
          user_type: userType
    };

    const result = await authService.register(userData);
    if (result.success) {
      showMessage('Регистрация прошла успешно!', 'success');
      if (onRegisterSuccess) {
        onRegisterSuccess(result.user);
        setTimeout(() => {
          navigate('/'); 
        }, 1000);
      }
    } else {
      showMessage(result.error || 'Ошибка регистрации', 'error');
    }
    setLoading(false);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showMessage('Функция восстановления пароля (демо-режим)', 'info');
  };

  return (
    <div className="container">
      <div className="tabs">
        <button 
          className={`tab ${activeForm === 'login' ? 'active' : ''}`}
          onClick={() => setActiveForm('login')}
        >
          Вход
        </button>
        <button 
          className={`tab ${activeForm === 'register' ? 'active' : ''}`}
          onClick={() => setActiveForm('register')}
        >
          Регистрация
        </button>
      </div>

      {/* Форма входа */}
      {activeForm === 'login' && (
        <div className="form active">
          <h2>Вход</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input 
                type="email" 
                id="login-email" 
                placeholder="Введите email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Пароль</label>
              <input 
                type="password" 
                id="login-password" 
                placeholder="Введите пароль"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                disabled={loading}
              />
              <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                Забыли пароль?
              </a>
            </div>
            <button type="submit" className="btn">Войти</button>
          </form>
          {message.visible && activeForm === 'login' && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </div>
      )}

      {/* Форма регистрации */}
      {activeForm === 'register' && (
        <div className="form active">
          <h2>Регистрация</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-name">Имя пользователя</label>
              <input 
                type="text" 
                id="register-name" 
                placeholder="Введите имя"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input 
                type="email" 
                id="register-email" 
                placeholder="Введите email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Пароль</label>
              <input 
                type="password" 
                id="register-password" 
                placeholder="Придумайте пароль"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-confirm-password">Подтверждение пароля</label>
              <input 
                type="password" 
                id="register-confirm-password" 
                placeholder="Повторите пароль"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Тип пользователя</label>
              <div className="user-type-group">
                <label className="user-type-option">
                  <input
                      type="radio"
                      name="userType"
                      value="applicant"
                      checked={userType === 'applicant'}
                      onChange={(e) => setUserType(e.target.value)}
                      disabled={loading}
                  />
                  <span>Соискатель</span>
                </label>
                <label className="user-type-option">
                  <input
                      type="radio"
                      name="userType"
                      value="employer"
                      checked={userType === 'employer'}
                      onChange={(e) => setUserType(e.target.value)}
                      disabled={loading}
                  />
                  <span>Работодатель / Компания</span>
                </label>
              </div>
            </div>
            <div className="password-requirements">
              * Пароль должен содержать минимум 8 символов
            </div>
            <button type="submit" className="btn">Зарегистрироваться</button>
          </form>
          {message.visible && activeForm === 'register' && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsLoginRegister;