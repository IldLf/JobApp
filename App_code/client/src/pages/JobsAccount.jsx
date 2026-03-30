import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import '../styles/JobsAccount.css';
import profileService from '../services/profileService';

// КОНСТАНТЫ ДАННЫХ

const CITIES = [
    { value: 'Москва', label: 'Москва' },
    { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
    { value: 'Новосибирск', label: 'Новосибирск' },
    { value: 'Екатеринбург', label: 'Екатеринбург' },
    { value: 'Казань', label: 'Казань' }
];

const PROFESSIONS = [
    { value: '1', label: 'Python разработчик' },
    { value: '2', label: 'Java разработчик' },
    { value: '3', label: 'JavaScript разработчик' },
    { value: '4', label: 'Frontend разработчик' },
    { value: '5', label: 'Backend разработчик' },
    { value: '6', label: 'Fullstack разработчик' }
];

const NOTIFICATIONS = [
    { 
        id: 1, 
        title: 'Новые вакансии по подписке', 
        description: 'Получать уведомления о новых вакансиях, соответствующих вашему профилю',
        defaultChecked: true 
    },
    { 
        id: 2, 
        title: 'Отклики на вакансии', 
        description: 'Уведомления о статусе ваших откликов',
        defaultChecked: true 
    },
    { 
        id: 3, 
        title: 'Приглашения от компаний', 
        description: 'Уведомления о новых приглашениях',
        defaultChecked: true 
    },
    { 
        id: 4, 
        title: 'Новости и обновления', 
        description: 'Информационные рассылки от сервиса',
        defaultChecked: false 
    }
];

const TABS = [
    { id: 'resumes', label: 'Мои резюме' },
    { id: 'responses', label: 'Отклики на вакансии' },
    { id: 'invites', label: 'Приглашения от компаний' },
    { id: 'settings', label: 'Настройки профиля' }
];

// Функция для форматирования статуса отклика
const formatResponseStatus = (status) => {
    const statusMap = {
        'pending': { text: 'На рассмотрении', class: 'status-pending' },
        'viewed': { text: 'Просмотрено', class: 'status-viewed' },
        'accepted': { text: 'Принято', class: 'status-accepted' },
        'rejected': { text: 'Отказ', class: 'status-rejected' }
    };
    return statusMap[status] || { text: status, class: 'status-pending' };
};

// Функция для форматирования зарплаты
const formatSalary = (salaryFrom, salaryTo) => {
    if (salaryFrom && salaryTo) {
        return `${salaryFrom.toLocaleString()} - ${salaryTo.toLocaleString()} ₽`;
    } else if (salaryFrom) {
        return `от ${salaryFrom.toLocaleString()} ₽`;
    } else if (salaryTo) {
        return `до ${salaryTo.toLocaleString()} ₽`;
    }
    return 'з/п не указана';
};


// главная функция
const JobsAccount = ({user, onLogout}) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('resumes');
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState(null);
    const [userApplicantData, setUserApplicantData] = useState(null);
    const [userResumeData, setUserResumeData] = useState([]);

    const [userResponsesData, setUserResponsesData] = useState([]);
    const [responsesStats, setResponsesStats] = useState(null);
    const [resumeResponses, setResumeResponses] = useState([]);

    const [stats, setStats] = useState(null);

    useEffect(() => { 
        loadUserData(); 
    }, []);

    const loadUserData = async () => { // функция загрузки данных 
        const currentUser = localStorage.getItem('user');

        if (!currentUser) { // если пользователь не зарегистрирован
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const user = JSON.parse(currentUser);
            
            // получаем профиль искателя работ
            const profileResult = await profileService.getApplicantData(user.id);
            console.log('Данные пользователя:', profileResult);
            
            if (profileResult.success) {
                setUserData(profileResult.profile.user);
                setUserApplicantData(profileResult.profile.applicant);
            } else {
                console.error('Ошибка загрузки профиля:', profileResult.error);
            }

            const resumesResult = await profileService.getApplicantResumes(user.id);
            console.log('Резюме:', resumesResult);
            
            if (resumesResult.success) {
                setUserResumeData(resumesResult.resumes || []);
            }

            // получаем статистику
            const statsResult = await profileService.getDashboardStats(user.id);
            console.log('Статистика:', statsResult);
            
            if (statsResult.success) {
                setStats(statsResult.stats);
            }

            // получаем отклики (если соискатель)
            if (user.user_type === 'applicant') {
                const responsesResult = await profileService.getResponsesData(user.id);
                console.log('Отклики:', responsesResult);

                if (responsesResult.success) {
                    setUserResponsesData(responsesResult.responses || []);
                    if (responsesResult.stats) {
                        setResponsesStats(responsesResult.stats);
                        // объединяем со статистикой дашборда
                        setStats(prev => ({ ...prev, ...responsesResult.stats }));
                    }
                } else {
                    console.error('Ошибка загрузки откликов:', responsesResult.error);
                    setUserResponsesData([]);
                }

                const resumeResponsesResult = await profileService.getApplicantResumeResponses(user.id);
                console.log('Приглашения:', resumeResponsesResult);

                if (resumeResponsesResult.success) {
                    setResumeResponses(resumeResponsesResult.resume_responses || []);
                }
            }
            
        } catch (error) {
            console.error('!!!Ошибка загрузки данных:', error);
            setUserResponsesData([]);
            setUserResumeData([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) { // экран загрузки
        return (
            <div className="account-loading">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    const showMessage = (text, type = 'info') => { // вылетающее сообщение
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleAction = (action) => {
        showMessage(`${action} (демо-режим)`);
    };

    const handleInviteStatus = (status) => {
        switch (status) {
            case 'accepted':
                return "Принято";
            case 'viewed':
                return "Просмотрено";
            case 'pending':
                return "В ожидании";
            case 'rejected':
                return "Отклонено";
            default:
                return 'Неизвестный статус';
        }
        return '';
    }

    return (
        <div className="main-container">
            {/* Хедер */}
            <Header user={user} onLogout={onLogout} />

            {/* Профиль */}
            <div className="profile-section">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {userData.first_name?.[0] || userData.email?.[0] || '?'}
                        {userData.last_name?.[0] || ''}
                    </div>
                    <div className="profile-title">
                        <h1>{userData.first_name} {userData.last_name}</h1>
                        <p>{userApplicantData?.profession || 'Профессия не указана'} • {userApplicantData?.city || 'Город не указан'}</p>
                        <p>{userData.email} • {userData.phone || 'Телефон не указан'}</p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-card">
                        <div className="stat-number">{stats?.total_resumes || userResumeData.length || 0}</div>
                        <div className="stat-label">Резюме</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats?.total_responses || userResponsesData.length || 0}</div>
                        <div className="stat-label">Откликов</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{resumeResponses.length || resumeResponses?.length || 0}</div>
                        <div className="stat-label">Приглашений</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats?.profile_views || 0}</div>
                        <div className="stat-label">Просмотров</div>
                    </div>
                </div>
            </div>

            {/* Табы */}
            <div className="account-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`account-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Контент: Мои резюме */}
            {activeTab === 'resumes' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Мои резюме</h2>
                            <button 
                                className="btn" 
                                onClick={() => showMessage('Функция создания резюме (демо-режим)')}
                            >
                                + Создать резюме
                            </button>
                        </div>
                        
                        <div className="items-list">
                            {userResumeData.length === 0 ? (
                                <div className="empty-state">
                                    <p className='empty-state-p'>У вас пока нет резюме :\</p>
                                    <button className="btn" onClick={() => showMessage('Создать резюме')}>
                                        Создать первое резюме
                                    </button>
                                </div>
                            ) : (
                                userResumeData.map(resume => (
                                    <div key={resume.id} className="item-card">
                                        <div className="item-header">
                                            <span className="item-title">{resume.title}</span>
                                            <span className="item-status status-active">Активно</span>
                                        </div>
                                        <div className="item-meta">
                                            {userApplicantData?.city || 'Город не указан'} • {resume.salary?.toLocaleString() || 'з/п не указана'} ₽
                                        </div>
                                        <div className="vacancy-description">
                                            {resume.experience || 'Опыт не указан'}
                                        </div>
                                        <div className="item-actions">
                                            <button className="item-action-btn" onClick={() => handleAction('Редактировать')}>
                                                Редактировать
                                            </button>
                                            <button className="item-action-btn" onClick={() => handleAction('Повысить')}>
                                                Повысить
                                            </button>
                                            <button className="item-action-btn" onClick={() => handleAction('Деактивировать')}>
                                                Деактивировать
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Контент: Отклики на вакансии*/}
            {activeTab === 'responses' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Мои отклики на вакансии</h2>
                        </div>
                        
                        <div className="items-list">
                            {userResponsesData.length === 0 ? (
                                <div className="empty-state">
                                    <p className='empty-state-p'>У вас пока нет откликов :\</p>
                                    <button className="btn" onClick={() => navigate('/search')}>
                                        Найти вакансии
                                    </button>
                                </div>
                            ) : (
                                userResponsesData.map(response => {
                                    const statusInfo = formatResponseStatus(response.status);
                                    return (
                                        <div key={response.response_id} className="item-card">
                                            <div className="item-header">
                                                <span className="item-title">{response.vacancy_title}</span>
                                                <span className={`item-status ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div className="item-company">{response.company_name}</div>
                                            <div className="item-meta">
                                                {response.vacancy_city} • {formatSalary(response.salary_from, response.salary_to)}
                                            </div>
                                            {response.cover_letter && (
                                                <div className="vacancy-description">
                                                    💬 {response.cover_letter}
                                                </div>
                                            )}
                                            <div className="item-meta" style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                                Отклик отправлен: {new Date(response.response_date).toLocaleDateString('ru-RU')}
                                            </div>
                                            <div className="item-actions">
                                                <button 
                                                    className="item-action-btn" 
                                                    onClick={() => handleAction('Просмотреть вакансию')}
                                                >
                                                    Подробнее
                                                </button>
                                                {response.status === 'pending' && (
                                                    <button 
                                                        className="item-action-btn" 
                                                        onClick={() => handleAction('Отозвать отклик')}
                                                    >
                                                        Отозвать
                                                    </button>
                                                )}
                                                {response.status === 'accepted' && (
                                                    <button 
                                                        className="item-action-btn" 
                                                        onClick={() => handleAction('Связаться с компанией')}
                                                    >
                                                        Связаться
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Контент: Приглашения от компаний */}
            {activeTab === 'invites' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Приглашения от компаний</h2>
                        </div>
                        
                        <div className="items-list">
                            {resumeResponses.map(response => (
                                <div key={response.id} className="item-card">
                                    <div className="item-header">
                                        <span className="item-title">Название приглашения</span>
                                        <span className={`item-status ${response.status}`}>{handleInviteStatus(response.status)}</span>
                                    </div>
                                    <div className="item-company">{response.name}</div>
                                    <div className="item-meta">{response.created_at}</div>
                                    <div className="vacancy-description">{response.message}</div>
                                    <div className="item-actions">
                                        <button 
                                            className="item-action-btn" 
                                            onClick={() => handleAction('Ответ на приглашение')}
                                        >
                                            Ответить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Контент: Настройки профиля */}
            {activeTab === 'settings' && (
                <div className="tab-content active">
                    <div className="card">
                        <h2 className="card-title" style={{ marginBottom: '30px' }}>Настройки профиля</h2>
                        
                        {/* Личные данные */}
                        <div className="settings-section">
                            <h3 className="settings-title">Личные данные</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Имя</label>
                                    <input 
                                        type="text" 
                                        defaultValue={userData.first_name || ''} 
                                        placeholder="Введите имя" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Фамилия</label>
                                    <input 
                                        type="text" 
                                        defaultValue={userData.last_name || ''} 
                                        placeholder="Введите фамилию" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        defaultValue={userData.email || ''} 
                                        placeholder="Введите email" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input 
                                        type="tel" 
                                        defaultValue={userData.phone || ''} 
                                        placeholder="Введите телефон" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Дата рождения</label>
                                    <input 
                                        type="date" 
                                        defaultValue={userApplicantData?.birth_date || ''} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Город</label>
                                    <select defaultValue={userApplicantData?.city || ''}>
                                        <option value="">Выберите город</option>
                                        {CITIES.map(city => (
                                            <option key={city.value} value={city.value}>
                                                {city.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>О себе</label>
                                    <textarea 
                                        defaultValue={userApplicantData?.about || ''}
                                        placeholder="Расскажите о себе"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Профессиональная информация */}
                        <div className="settings-section">
                            <h3 className="settings-title">Профессиональная информация</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Профессия</label>
                                    <select defaultValue={userApplicantData?.profession || ''}>
                                        <option value="">Выберите профессию</option>
                                        {PROFESSIONS.map(prof => (
                                            <option key={prof.value} value={prof.label}>
                                                {prof.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Опыт работы (лет)</label>
                                    <input 
                                        type="number" 
                                        defaultValue={userApplicantData?.experience_years || 0} 
                                        min="0" 
                                        max="50" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ожидаемая зарплата</label>
                                    <input 
                                        type="number" 
                                        defaultValue={userApplicantData?.expected_salary || ''} 
                                        placeholder="Введите сумму" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Образование</label>
                                    <input 
                                        type="text" 
                                        defaultValue={userApplicantData?.education || ''} 
                                        placeholder="Введите образование" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Безопасность */}
                        <div className="settings-section">
                            <h3 className="settings-title">Безопасность</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Текущий пароль</label>
                                    <input 
                                        type="password" 
                                        placeholder="Введите текущий пароль" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Новый пароль</label>
                                    <input 
                                        type="password" 
                                        placeholder="Введите новый пароль" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Подтверждение пароля</label>
                                    <input 
                                        type="password" 
                                        placeholder="Повторите новый пароль" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Уведомления */}
                        <div className="settings-section">
                            <h3 className="settings-title">Уведомления</h3>
                            
                            {NOTIFICATIONS.map(notif => (
                                <div key={notif.id} className="notification-row">
                                    <div className="notification-info">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.description}</p>
                                    </div>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            defaultChecked={notif.defaultChecked} 
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Кнопки действий */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button 
                                className="btn" 
                                onClick={() => showMessage('Изменения сохранены (демо-режим)', 'success')}
                            >
                                Сохранить изменения
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => showMessage('Изменения отменены')}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Сообщение */}
            {message.visible && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default JobsAccount;