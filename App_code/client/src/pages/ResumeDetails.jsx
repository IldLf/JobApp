import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/ResumeDetails.css';
import catalogService from '../services/catalogService';
import '../styles/JobsCatalog.css';
import '../styles/ResponseModal.css';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

  // Загрузка данных пользователя
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Загрузка данных резюме
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/resumes/${id}`);
        const data = await response.json();
        if (data.success && data.resume) {
          setResume(data.resume);
        } else {
          setError('Резюме не найдено');
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type, visible: true });
    setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
  };

    const handleRespond = async () => {
    if (!user || user.user_type !== 'employer') {
        showMessage('Только работодатели могут откликаться на резюме', 'error');
        return;
    }

    if (!coverLetter.trim()) {
        showMessage('Пожалуйста, добавьте сопроводительное письмо', 'error');
        return;
    }

    setApplying(true);

    try {
        const result = await catalogService.respondToResume(
        parseInt(id),
        user.id,
        coverLetter.trim()
        );

        if (result.success) {
        showMessage(' Приглашение успешно отправлено', 'success');
        setShowModal(false);
        setCoverLetter('');
        } else {
        showMessage(` ${result.error || 'Неизвестная ошибка'}`, 'error');
        }
    } catch (err) {
        console.error('Respond error:', err);
        showMessage('Ошибка соединения с сервером.', 'error');
    } finally {
        setApplying(false);
    }
    };

  const canRespond = user && user.user_type === 'employer';

  if (loading) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} />
        <div className="resume-details-loading">Загрузка резюме...</div>
      </>
    );
  }

  if (error || !resume) {
    return (
      <>
        <Header user={user} onLogout={handleLogout} />
        <div className="resume-details-error">
          <h2>⚠️ {error || 'Резюме не найдено'}</h2>
          <button onClick={() => navigate('/catalog')} className="back-btn">
            ← Вернуться к поиску
          </button>
        </div>
      </>
    );
  }

  const { User, Profession } = resume;

  return (
    <div className="main-container">
      <Header user={user} onLogout={handleLogout} />
      <div className="resume-details-container">
        {/* Хедер резюме */}
        <div className="resume-header">
          <button onClick={() => navigate('/catalog')} className="back-btn">
            ← Назад к поиску
          </button>
          <h1 className="resume-title">{resume.title}</h1>
          {Profession && <span className="resume-profession">{Profession.name}</span>}
        </div>

        {/* Основная информация */}
        <div className="resume-info-grid">
          <div className="resume-card">
            <h3>👤 Соискатель</h3>
            <p className="applicant-name">{User?.username || 'Не указано'}</p>
            {User?.email && <p className="applicant-email">📧 {User.email}</p>}
          </div>

          <div className="resume-card">
            <h3>💰 Желаемая зарплата</h3>
            <p className="resume-salary">
              {resume.salary 
                ? `${resume.salary.toLocaleString()} ₽`
                : 'Не указана'}
            </p>
          </div>

          <div className="resume-card">
            <h3>⏱ Опыт работы</h3>
            <p>{resume.experience || 'Не указан'}</p>
          </div>
        </div>

        {/* Описание резюме (about) */}
        <div className="resume-description">
          <h3>📝 О себе</h3>
          <div className="resume-desc-text">
            {resume.description || resume.about || 'Описание не заполнено'}
          </div>
        </div>
      </div>

      {/* Кнопка отклика */}
      {canRespond && (
        <div className="resume-actions-fixed">
          <button
            className="respond-btn-large"
            onClick={() => setShowModal(true)}
            disabled={applying}
          >
            {applying ? 'Отправка...' : '✉️ Отправить приглашение'}
          </button>
        </div>
      )}

      {/* Модальное окно для отклика */}
      {showModal && (
        <div className="response-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="response-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Приглашение соискателю</h3>
            <p className="response-modal-target">{resume.title}</p>

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
                onClick={handleRespond}
                disabled={applying || !coverLetter.trim()}
              >
                {applying ? 'Отправка...' : 'Отправить приглашение'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Всплывающее сообщение */}
      {message.visible && (
        <div className={`message ${message.type} ${message.visible ? 'show' : ''}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default ResumeDetails;