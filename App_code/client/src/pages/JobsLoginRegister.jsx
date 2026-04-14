import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/JobsLoginRegister.css';

const JobsLoginRegister = ({ onLoginSuccess, onRegisterSuccess }) => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
      first_name: '',
      last_name: '',  
      email: '',
      password: '',
      confirmPassword: ''
  });
  const [userType, setUserType] = useState('applicant');
  const [message, setMessage] = useState({ text: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);


  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
      name: '',
      description: '',
      city: '',
      inn: ''
  });
  const [companyErrors, setCompanyErrors] = useState({});

  const showMessage = (text, type) => {
    setMessage({ text, type, visible: true });
    setTimeout(() => {
      setMessage({ text: '', type: '', visible: false });
    }, 3000);
  };

  const validateCompany = () => {
    const errors = {};
    if (!companyData.name.trim()) errors.name = 'Название компании обязательно';
    if (!companyData.city) errors.city = 'Выберите город';
    if (!companyData.inn) {
        errors.inn = 'ИНН обязателен';
    } else if (!/^\d{10}$|^\d{12}$/.test(companyData.inn)) {
        errors.inn = 'ИНН должен содержать 10 или 12 цифр';
    }
    setCompanyErrors(errors);
    return Object.keys(errors).length === 0;
};

  const handleCompanySubmit = () => {
      if (validateCompany()) {
          setShowCompanyModal(false);
          performRegistration(companyData);
      }
  };

  const handleCompanyChange = (field, value) => {
      setCompanyData(prev => ({ ...prev, [field]: value }));
      if (companyErrors[field]) {
          setCompanyErrors(prev => ({ ...prev, [field]: '' }));
      }
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
    const { first_name, last_name, email, password, confirmPassword } = registerData;

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
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

    if (userType === 'employer') {
        setShowCompanyModal(true);
    } else {
        await performRegistration();
    }
  };

  const performRegistration = async (companyInfo = null) => {
    setLoading(true);
    showMessage('Регистрация...', 'info');

    const userData = {
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        user_type: userType,
        company: companyInfo  // для работодателя передаём данные компании
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
              <label htmlFor="register-first-name">Имя</label>
              <input 
                type="text" 
                id="register-first-name" 
                placeholder="Введите имя"
                value={registerData.first_name}
                onChange={(e) => setRegisterData({...registerData, first_name: e.target.value})}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-last-name">Фамилия</label>
              <input 
                type="text" 
                id="register-last-name" 
                placeholder="Введите фамилию"
                value={registerData.last_name}
                onChange={(e) => setRegisterData({...registerData, last_name: e.target.value})}
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

      {/* Модальное окно для данных компании */}
      {showCompanyModal && (
          <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Данные компании</h3>
                  <div className="form-group">
                      <label>Название компании *</label>
                      <input
                          type="text"
                          value={companyData.name}
                          onChange={(e) => handleCompanyChange('name', e.target.value)}
                          placeholder="ООО Пример"
                      />
                      {companyErrors.name && <small className="error-text">{companyErrors.name}</small>}
                  </div>
                  <div className="form-group">
                      <label>Описание</label>
                      <textarea
                          value={companyData.description}
                          onChange={(e) => handleCompanyChange('description', e.target.value)}
                          placeholder="Краткое описание компании"
                          rows="3"
                      />
                  </div>
                  <div className="form-group">
                      <label>Город *</label>
                      <select value={companyData.city} onChange={(e) => handleCompanyChange('city', e.target.value)}>
                          <option value="">Выберите город</option>
                          <option value="Москва">Москва</option>
                          <option value="Санкт-Петербург">Санкт-Петербург</option>
                          <option value="Новосибирск">Новосибирск</option>
                          <option value="Екатеринбург">Екатеринбург</option>
                          <option value="Казань">Казань</option>
                      </select>
                      {companyErrors.city && <small className="error-text">{companyErrors.city}</small>}
                  </div>
                  <div className="form-group">
                      <label>ИНН *</label>
                      <input
                          type="text"
                          value={companyData.inn}
                          onChange={(e) => handleCompanyChange('inn', e.target.value)}
                          placeholder="10 или 12 цифр"
                          maxLength="12"
                      />
                      {companyErrors.inn && <small className="error-text">{companyErrors.inn}</small>}
                  </div>
                  <div className="modal-buttons">
                      <button className="btn btn-outline" onClick={() => setShowCompanyModal(false)}>Отмена</button>
                      <button className="btn" onClick={handleCompanySubmit}>Зарегистрироваться</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default JobsLoginRegister;