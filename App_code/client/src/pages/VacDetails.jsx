import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import catalogService from '../services/catalogService';
import '../styles/VacDetails.css';
import '../styles/ResponseModal.css';

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

  // Для выбора резюме
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Загрузка данных пользователя
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Загрузка резюме пользователя
  useEffect(() => {
    const loadUserResumes = async () => {
      if (user && user.user_type === 'applicant') {
        try {
          const resumes = await catalogService.getUserResumes(user.id);
          setUserResumes(resumes);
          if (resumes.length > 0) {
            setSelectedResumeId(resumes[0].id);
          }
        } catch (err) {
          console.error('Error loading resumes:', err);
        }
      }
    };
    loadUserResumes();
  }, [user]);

  // Загрузка данных вакансии
  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/vacancies/${id}`);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleApply = async () => {
    if (!user || user.user_type !== 'applicant') {
      alert('Только соискатели могут откликаться на вакансии');
      return;
    }

    if (!selectedResumeId) {
      alert('Пожалуйста, выберите резюме для отклика');
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
        resume_id: selectedResumeId,
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

  // Функция для отображения типа занятости на русском
  const getEmploymentTypeDisplay = (type) => {
    const map = {
      'full-time': 'Полная занятость',
      'part-time': 'Частичная занятость',
      'project': 'Проектная работа',
      'train': 'Стажировка'
    };
    return map[type] || type || 'Не указан';
  };

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
      <div className="main-container">
        <Header user={user} onLogout={handleLogout} />

        <div className="vac-details-container">
          {/* Хедер вакансии */}
          <div className="vac-header">
            <button onClick={() => navigate('/catalog')} className="back-btn">
              ← Назад к поиску
            </button>
            <h1 className="vac-title">{vacancy.title}</h1>
            {Profession && <span className="vac-profession">{Profession.name}</span>}
          </div>

          {/* Основная информация - компактная сетка */}
          <div className="vac-info-grid">
            <div className="vac-card">
              <h3>🏢 Компания</h3>
              <p className="company-name">{Company?.name || 'Не указано'}</p>
              {Company?.city && <p className="company-location">📍 {Company.city}</p>}
            </div>

            <div className="vac-card">
              <h3>💰 Зарплата</h3>
              <p className="vac-salary">
                {vacancy.salary_from && vacancy.salary_to
                    ? `${vacancy.salary_from.toLocaleString()} - ${vacancy.salary_to.toLocaleString()} ₽`
                    : vacancy.salary_from
                        ? `от ${vacancy.salary_from.toLocaleString()} ₽`
                        : vacancy.salary_to
                            ? `до ${vacancy.salary_to.toLocaleString()} ₽`
                            : 'Не указана'}
              </p>
            </div>

            <div className="vac-card">
              <h3>📍 Локация</h3>
              <p>{vacancy.city || 'Не указано'}</p>
            </div>

            <div className="vac-card">
              <h3>⏱ Опыт работы</h3>
              <p>{vacancy.experience_required || 'Не указан'}</p>
            </div>

            <div className="vac-card">
              <h3>📋 Тип занятости</h3>
              <p>{getEmploymentTypeDisplay(vacancy.employment_type)}</p>
            </div>
          </div>

          {/* Описание вакансии */}
          <div className="vac-description">
            <h3>📝 Описание вакансии</h3>
            <div className="vac-desc-text">
              {vacancy.description || 'Подробное описание вакансии будет добавлено позже.'}
            </div>
          </div>

          {/* Дополнительная информация о компании */}
          {Company?.description && (
              <div className="vac-company-info">
                <h3>🏢 О компании</h3>
                <p>{Company.description}</p>
              </div>
          )}

          {/* Информационное сообщение для работодателей */}
          {!canApply && user && (
              <div className="vac-info-message">
                <p>ℹ️ Вы вошли как работодатель. Отклик на вакансии доступен только соискателям.</p>
              </div>
          )}
        </div>

        {/* Кнопка отклика */}
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

        {/* Модальное окно для отклика - используем те же стили что и в JobsCatalog */}
        {showModal && (
            <div className="response-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="response-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Отклик на вакансию</h3>
                <p className="response-modal-target">{vacancy.title}</p>

                {/* Выбор резюме */}
                {userResumes.length > 0 && (
                    <div className="response-modal-resume-select">
                      <label>Выберите резюме для отклика:</label>
                      <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="resume-select"
                      >
                        {userResumes.map(resume => (
                            <option key={resume.id} value={resume.id}>
                              {resume.title}
                            </option>
                        ))}
                      </select>
                    </div>
                )}

                {userResumes.length === 0 && (
                    <div className="response-modal-warning">
                      ⚠️ У вас нет активных резюме.
                      <a href="/account">Создайте резюме</a> перед откликом.
                    </div>
                )}

                <textarea
                    className="response-modal-textarea"
                    placeholder="Напишите сопроводительное письмо..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                />

                <div className="response-modal-buttons">
                  <button
                      className="response-modal-btn response-modal-btn-cancel"
                      onClick={() => setShowModal(false)}
                      disabled={applying}
                  >
                    Отмена
                  </button>
                  <button
                      className="response-modal-btn response-modal-btn-submit"
                      onClick={handleApply}
                      disabled={applying || userResumes.length === 0 || !coverLetter.trim()}
                  >
                    {applying ? 'Отправка...' : 'Отправить отклик'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default VacDetails;