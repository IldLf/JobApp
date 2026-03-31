import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';  // 👈 ИМПОРТ СУЩЕСТВУЮЩЕГО HEADER
import '../styles/VacDetails.css';

const VacDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  // Загрузка данных пользователя
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Загрузка данных вакансии
  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT || 5000}/api/vacancies/${id}`);
        const data = await response.json();
        
        if (data.success && data.vacancy) {
          setVacancy(data.vacancy);
        } else {
          setError('Вакансия не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVacancy();
    }
  }, [id]);

  // Обработчик выхода
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Обработчик отклика на вакансию
  const handleApply = async () => {
    if (!user || user.user_type !== 'applicant') {
      alert('Только соискатели могут откликаться на вакансии');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Пожалуйста, добавьте сопроводительное письмо');
      return;
    }

    setApplying(true);
    
    try {
      const requestBody = {
        vacancy_id: parseInt(id),
        user_id: user.id,
        cover_letter: coverLetter.trim()
      };

      const response = await fetch('http://localhost:5000/api/vacancy-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Отклик успешно отправлен!');
        setShowModal(false);
        setCoverLetter('');
      } else {
        alert(`❌ ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      console.error('Apply error:', err);
      alert('Ошибка соединения с сервером. Проверьте, запущен ли сервер.');
    } finally {
      setApplying(false);
    }
  };

  const canApply = user && user.user_type === 'applicant';

  if (loading) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} />
        <div className="vac-details-loading">Загрузка вакансии...</div>
      </>
    );
  }

  if (error || !vacancy) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} />
        <div className="vac-details-error">
          <h2>⚠️ {error || 'Вакансия не найдена'}</h2>
          <button onClick={() => navigate('/catalog')} className="back-btn">
            ← Вернуться к поиску
          </button>
        </div>
      </>
    );
  }

  const { Company, Profession } = vacancy;

  return (
    <>
      {/* ХЭДЭР — ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩИЙ КОМПОНЕНТ */}
      <Header user={user} onLogout={handleLogout} />

      <div className="vac-details-container">
        {/* Хедер вакансии */}
        <div className="vac-header">
          <button onClick={() => navigate('/catalog')} className="back-btn">
            ← Назад
          </button>
          <h1 className="vac-title">{vacancy.title}</h1>
          {Profession && <span className="vac-profession">{Profession.name}</span>}
        </div>

        {/* Основная информация - в одну строку */}
        <div className="vac-info-grid">
          <div className="vac-card">
            <h3>🏢 Компания</h3>
            <p className="company-name">{Company?.name || 'Не указано'}</p>
            {Company?.logo_url && (
              <img 
                src={Company.logo_url} 
                alt={Company.name} 
                className="company-logo"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          <div className="vac-card">
            <h3>💰 Зарплата</h3>
            <p className="vac-salary">
              {vacancy.salary_from && vacancy.salary_to 
                ? `${vacancy.salary_from} - ${vacancy.salary_to} ₽`
                : vacancy.salary_from 
                  ? `от ${vacancy.salary_from} ₽`
                  : vacancy.salary_to 
                    ? `до ${vacancy.salary_to} ₽`
                    : 'Не указана'}
            </p>
          </div>

          <div className="vac-card">
            <h3>📍 Локация</h3>
            <p>{vacancy.city || 'Не указано'}</p>
          </div>

          <div className="vac-card">
            <h3>⏱ Опыт</h3>
            <p>{vacancy.experience_required || 'Не указан'}</p>
          </div>

          <div className="vac-card">
            <h3>📋 Тип занятости</h3>
            <p>{vacancy.employment_type || 'Не указан'}</p>
          </div>
        </div>

        {/* Описание вакансии - широкое */}
        <div className="vac-description">
          <h3>📝 Подробное описание</h3>
          <p className="vac-desc-text">
            {vacancy.description || 
             'Подробное описание вакансии будет добавлено позже. ' +
             'Сейчас отображается информация из карточки поиска.'}
          </p>
        </div>

        {/* Информационное сообщение для работодателей */}
        {!canApply && user && (
          <div className="vac-info-message">
            <p>ℹ️ Вы вошли как работодатель. Кнопка отклика доступна только соискателям.</p>
          </div>
        )}
      </div>

      {/* КНОПКА ОТКЛИКА - всегда видна, по центру */}
      {canApply && (
        <div className="vac-actions-fixed">
          <button 
            className="apply-btn-large"
            onClick={() => setShowModal(true)}
            disabled={applying}
          >
            {applying ? 'Отправка...' : '✉️ Откликнуться на вакансию'}
          </button>
        </div>
      )}

      {/* Модальное окно для сопроводительного письма */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📝 Сопроводительное письмо</h3>
            <textarea
              className="cover-letter-input"
              placeholder="Расскажите, почему вы подходите на эту позицию..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows="5"
            />
            <div className="modal-buttons">
              <button 
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button 
                className="modal-send"
                onClick={handleApply}
                disabled={applying || !coverLetter.trim()}
              >
                {applying ? 'Отправка...' : 'Отправить отклик'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VacDetails;