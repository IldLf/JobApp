import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/JobsRealMain.css';

const JobsRealMain = ({user, onLogout}) => {
  console.log('JobsRealMain received user:', user);
  const [message, setMessage] = useState({ text: '', type: 'info', visible: false });
  const [searchQuery, setSearchQuery] = useState('');

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type, visible: true });
    setTimeout(() => {
      setMessage(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    showMessage(`Поиск по запросу "${searchQuery}" (демо-режим)`);
  };

  const handleTagClick = (e, tag) => {
    e.preventDefault();
    showMessage(`Поиск по категории "${tag}" (демо-режим)`);
  };

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    showMessage(`Переход в категорию "${category}" (демо-режим)`);
  };

  const handleVacancyClick = (title) => {
    showMessage(`Просмотр вакансии "${title}" (демо-режим)`);
  };

  const handleResponseClick = (e, title) => {
    e.stopPropagation();
    showMessage(`Отклик на вакансию "${title}" отправлен! (демо-режим)`);
  };

  const handleFooterLinkClick = (e, text) => {
    e.preventDefault();
    showMessage(`Переход по ссылке "${text}" (демо-режим)`);
  };

  const handleCreateResume = (e) => {
    e.preventDefault();
    showMessage('Создание резюме (демо-режим)');
  };

  const handleViewAllVacancies = (e) => {
    e.preventDefault();
    showMessage('Переход к списку всех вакансий (демо-режим)');
  };

  // Данные для преимуществ
  const features = [
    { icon: '📋', title: 'Тысячи вакансий', desc: 'Ежедневно публикуются новые вакансии от ведущих компаний' },
    { icon: '⚡', title: 'Быстрый отклик', desc: 'Откликайтесь в один клик, отслеживайте статус в личном кабинете' },
    { icon: '🎯', title: 'Умный поиск', desc: 'Точные фильтры и рекомендации на основе вашего опыта' },
    { icon: '🔒', title: 'Безопасность', desc: 'Ваши данные надежно защищены' }
  ];

  // Данные для категорий
  const categories = [
    { icon: '💻', name: 'IT и разработка', count: '1 247 вакансий' },
    { icon: '📊', name: 'Аналитика данных', count: '856 вакансий' },
    { icon: '🎨', name: 'Дизайн', count: '432 вакансии' },
    { icon: '📈', name: 'Маркетинг', count: '654 вакансии' },
    { icon: '💰', name: 'Финансы', count: '321 вакансия' },
    { icon: '👥', name: 'HR и управление', count: '287 вакансий' }
  ];

  // Данные для вакансий
  const vacancies = [
    {
      title: 'Senior Python разработчик',
      salary: '300 000 - 400 000 ₽',
      company: 'Яндекс',
      city: 'Москва',
      description: 'Разработка высоконагруженных сервисов, оптимизация производительности.',
      tags: ['Python', 'Django', 'PostgreSQL']
    },
    {
      title: 'Frontend разработчик (React)',
      salary: '250 000 - 350 000 ₽',
      company: 'Ozon',
      city: 'Москва',
      description: 'Разработка интерфейсов для личного кабинета и административной панели.',
      tags: ['React', 'TypeScript', 'Redux']
    },
    {
      title: 'Data Scientist',
      salary: '280 000 - 380 000 ₽',
      company: 'Сбер',
      city: 'Москва',
      description: 'Разработка моделей машинного обучения для кредитного скоринга.',
      tags: ['Python', 'ML', 'SQL']
    },
    {
      title: 'DevOps инженер',
      salary: '260 000 - 360 000 ₽',
      company: 'Wildberries',
      city: 'Москва',
      description: 'Поддержка и развитие инфраструктуры, CI/CD, мониторинг.',
      tags: ['Kubernetes', 'Docker', 'CI/CD']
    }
  ];

  // Данные для статистики
  const stats = [
    { number: '15 000+', label: 'Вакансий' },
    { number: '8 500+', label: 'Компаний' },
    { number: '2 300+', label: 'Резюме' },
    { number: '45 000+', label: 'Пользователей' }
  ];

  // Данные для футера
  const footerColumns = [
    {
      title: 'Job Board',
      links: ['О проекте', 'Контакты', 'Партнерам', 'Помощь']
    },
    {
      title: 'Соискателям',
      links: ['Поиск вакансий', 'Создать резюме', 'Советы по карьере', 'Категории']
    },
    {
      title: 'Работодателям',
      links: ['Разместить вакансию', 'Поиск резюме', 'Тарифы', 'Кабинет работодателя']
    },
    {
      title: 'Контакты',
      links: ['support@jobboard.ru', '8 (800) 123-45-67', 'Telegram', 'WhatsApp']
    }
  ];

  const popularTags = ['Python разработчик', 'Аналитик данных', 'UX/UI дизайнер', 'Project Manager'];

  return (
    <div className="main-container">
      <Header user={user} onLogout={onLogout} />

      {/* Hero секция */}
      <div className="hero-section">
        <h1 className="hero-title">Найди работу своей мечты</h1>
        <p className="hero-subtitle">Тысячи вакансий в IT, финансах, маркетинге и других сферах</p>
        
        {/* Быстрый поиск */}
        <form className="hero-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="hero-search-input" 
            placeholder="Должность, навыки или компания"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="hero-search-btn">Найти</button>
        </form>
        
        {/* Популярные запросы */}
        <div className="popular-searches">
          <span className="popular-searches-label">Популярно:</span>
          {popularTags.map(tag => (
            <a 
              key={tag}
              href="#" 
              className="popular-search-tag"
              onClick={(e) => handleTagClick(e, tag)}
            >
              {tag}
            </a>
          ))}
        </div>
      </div>

      {/* Преимущества */}
      <div className="features-section">
        <h2 className="section-title">Почему выбирают нас</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Популярные категории */}
      <div className="categories-section">
        <h2 className="section-title">Популярные категории</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <a 
              key={index}
              href="#" 
              className="category-card"
              onClick={(e) => handleCategoryClick(e, category.name)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-count">{category.count}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Рекомендуемые вакансии */}
      <div className="featured-vacancies-section">
        <h2 className="section-title">Рекомендуемые вакансии</h2>
        <div className="vacancies-grid">
          {vacancies.map((vacancy, index) => (
            <div 
              key={index} 
              className="vacancy-card"
              onClick={() => handleVacancyClick(vacancy.title)}
            >
              <div className="vacancy-header">
                <span className="vacancy-title">{vacancy.title}</span>
                <span className="vacancy-salary">{vacancy.salary}</span>
              </div>
              <div className="vacancy-company">{vacancy.company} • {vacancy.city}</div>
              <div className="vacancy-description">{vacancy.description}</div>
              <div className="vacancy-tags">
                {vacancy.tags.map(tag => (
                  <span key={tag} className="vacancy-tag">{tag}</span>
                ))}
              </div>
              <button 
                className="response-btn"
                onClick={(e) => handleResponseClick(e, vacancy.title)}
              >
                Откликнуться
              </button>
            </div>
          ))}
        </div>
        
        <div className="centered">
          <a 
            href="#" 
            className="btn btn-large"
            onClick={handleViewAllVacancies}
          >
            Смотреть все вакансии
          </a>
        </div>
      </div>

      {/* Статистика */}
      <div className="stats-section">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2 className="cta-title">Готовы начать поиск работы?</h2>
        <p className="cta-subtitle">Создайте резюме и получайте предложения от ведущих компаний</p>
        <a 
          href="#" 
          className="btn btn-large"
          onClick={handleCreateResume}
        >
          Создать резюме
        </a>
      </div>

      {/* Футер */}
      <footer className="footer">
        <div className="footer-grid">
          {footerColumns.map((column, idx) => (
            <div key={idx} className="footer-column">
              <h4 className="footer-title">{column.title}</h4>
              <ul className="footer-links">
                {column.links.map(link => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="footer-link"
                      onClick={(e) => handleFooterLinkClick(e, link)}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div>© 2026 Job Board. Все права защищены.</div>
          <div>
            {['Политика конфиденциальности', 'Пользовательское соглашение'].map(link => (
              <a 
                key={link}
                href="#" 
                className="footer-bottom-link"
                onClick={(e) => handleFooterLinkClick(e, link)}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Сообщение для демо-режима */}
      {message.visible && (
        <div id="message" className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default JobsRealMain;