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

    const [activeTab, setActiveTab] = useState('settings');
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState(null);
    const [userApplicantData, setUserApplicantData] = useState(null);
    const [userResumeData, setUserResumeData] = useState([]);

    const [userResponsesData, setUserResponsesData] = useState([]);
    const [resumeResponses, setResumeResponses] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        city: '',
        about: '',
        profession: '',
        experience_years: '',
        expected_salary: '',
        education: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [saving, setSaving] = useState(false);


    const [employerData, setEmployerData] = useState(null);
    const [employerVacancies, setEmployerVacancies] = useState([]);
    const [employerResponses, setEmployerResponses] = useState([]);
    const [employerResumeResponses, setEmployerResumeResponses] = useState([]);


    useEffect(() => { 
        loadUserData(); 
    }, []);

    useEffect(() => { 
        const currentUser = localStorage.getItem('user');
        if (!currentUser) return;
        const user = JSON.parse(currentUser);

        if (user.user_type === 'applicant' && userData && userApplicantData) {
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                birth_date: userApplicantData.birth_date || '',
                city: userApplicantData.city || '',
                about: userApplicantData.about || '',
                profession: userApplicantData.profession || '',
                experience_years: userApplicantData.experience_years || '',
                expected_salary: userApplicantData.expected_salary || '',
                education: userApplicantData.education || ''
            });
        }
        else if (user.user_type === 'employer' && userData && employerData) {
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                company_name: employerData.name || '',
                company_description: employerData.description || '',
                company_city: employerData.city || '',
                logo_url: employerData.logo_url || ''
            });
        }
    }, [userData, userApplicantData, employerData]);

    const loadUserData = async () => { // функция загрузки данных 
        const currentUser = localStorage.getItem('user');

        if (!currentUser) { // если пользователь не зарегистрирован
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const user = JSON.parse(currentUser);
            
            if (user.user_type === 'applicant') {
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


                // получаем отклики (если соискатель)
                if (user.user_type === 'applicant') {
                    const responsesResult = await profileService.getResponsesData(user.id);
                    console.log('Отклики:', responsesResult);

                    if (responsesResult.success) {
                        setUserResponsesData(responsesResult.responses || []);
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
            }
            else if (user.user_type === 'employer') {
                // Загружаем профиль работодателя
                const profileResult = await profileService.getEmployerData(user.id);
                if (profileResult.success) {
                    setUserData(profileResult.profile.user);
                    setEmployerData(profileResult.profile.company);
                }
                
                // Загружаем вакансии
                const vacanciesResult = await profileService.getEmployerVacancies(user.id);
                if (vacanciesResult.success) {
                    setEmployerVacancies(vacanciesResult.vacancies || []);
                }
                
                // Загружаем отклики на вакансии
                const responsesResult = await profileService.getEmployerResponses(user.id);
                if (responsesResult.success) {
                    setEmployerResponses(responsesResult.responses || []);
                }
                
                // Загружаем отправленные приглашения
                const resumeResponsesResult = await profileService.getEmployerResumeResponses(user.id);
                if (resumeResponsesResult.success) {
                    setEmployerResumeResponses(resumeResponsesResult.resume_responses || []);
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

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            let result;
            
            if (currentUser.user_type === 'applicant') {
                // Обновляем профиль
                result = await profileService.updateApplicantProfile(currentUser.id, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    city: formData.city,
                    profession: formData.profession,
                    experience_years: parseInt(formData.experience_years) || 0,
                    about: formData.about,
                    expected_salary: parseInt(formData.expected_salary) || null,
                    education: formData.education,
                    birth_date: formData.birth_date
                });
            }
            else if (currentUser.user_type === 'employer') {
                result = await profileService.updateEmployerProfile(currentUser.id, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    company_name: formData.company_name,
                    company_description: formData.company_description,
                    company_city: formData.company_city,
                    logo_url: formData.logo_url
                });
            }
            if (result.success) {
                showMessage('Профиль успешно сохранен!', 'success');
                await loadUserData();
            } else {
                showMessage(result.error || 'Ошибка сохранения профиля', 'error');
            }
        } catch (error) {
            showMessage('Ошибка при сохранении', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelChanges = () => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser.user_type === 'applicant') {
            if (userData && userApplicantData) {
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    birth_date: userApplicantData.birth_date || '',
                    city: userApplicantData.city || '',
                    about: userApplicantData.about || '',
                    profession: userApplicantData.profession || '',
                    experience_years: userApplicantData.experience_years || '',
                    expected_salary: userApplicantData.expected_salary || '',
                    education: userApplicantData.education || ''
                });
            }
        }
        else if (currentUser.user_type === 'employer') {
            if (userData && employerData) {
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    company_name: employerData.name || '',
                    company_description: employerData.description || '',
                    company_city: employerData.city || '',
                    logo_url: employerData.logo_url || ''
                });
            }
        }
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        
        showMessage('Изменения отменены', 'info');
    };

    const handleSavePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            showMessage('Новый пароль и подтверждение не совпадают', 'error');
            return;
        }
        
        if (passwordData.new_password.length < 6) {
            showMessage('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        setSaving(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            
            const result = await profileService.updatePassword(currentUser.id, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            
            if (result.success) {
                showMessage('Пароль успешно изменен!', 'success');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            } else {
                showMessage(result.error || 'Ошибка изменения пароля', 'error');
            }
        } catch (error) {
            showMessage('Ошибка при изменении пароля', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
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
    }

    const getTabs = () => {
        const currentUser = localStorage.getItem('user');
        if (!currentUser) return TABS;
        const user = JSON.parse(currentUser);
        
        if (user.user_type === 'applicant') {
            return TABS;
        } else {
            return [
                { id: 'vacancies', label: 'Мои вакансии' },
                { id: 'received-responses', label: 'Полученные отклики' },
                { id: 'sent-invites', label: 'Отправленные приглашения' },
                { id: 'settings', label: 'Настройки профиля' }
            ];
        }
    };

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
                        {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                            <p>{userApplicantData?.profession || 'Профессия не указана'} • {userApplicantData?.city || 'Город не указан'}</p>
                        ) : (
                            <p>{formData?.company_name || 'Имя компании не указано'} • {formData?.company_city || 'Город не указан'}</p>
                        )}
                        <p>{userData.email} • {userData.phone || 'Телефон не указан'}</p>
                    </div>
                </div>
                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-number">{userResumeData?.length || 0}</div>
                            <div className="stat-label">Резюме</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{userResponsesData?.length || 0}</div>
                            <div className="stat-label">Откликов</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{resumeResponses?.length || 0}</div>
                            <div className="stat-label">Приглашений</div>
                        </div>
                    </div>
                ) : (
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-number">{employerVacancies?.length || 0}</div>
                            <div className="stat-label">Резюме</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{employerResponses?.length || 0}</div>
                            <div className="stat-label">Откликов</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{employerResumeResponses?.length || 0}</div>
                            <div className="stat-label">Приглашений</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Табы */}
            <div className="account-tabs">
                {getTabs().map(tab => (
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
                                        value={formData.first_name} 
                                        onChange={(e) => handleFormChange('first_name', e.target.value)}
                                        placeholder="Введите имя" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Фамилия</label>
                                    <input 
                                        type="text" 
                                        value={formData.last_name}
                                        onChange={(e) => handleFormChange('last_name', e.target.value)}
                                        placeholder="Введите фамилию" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        disabled
                                        style={{ backgroundColor: '#f5f5f5' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={(e) => handleFormChange('phone', e.target.value)}
                                        placeholder="Введите телефон" 
                                    />
                                </div>

                                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                                <div className="form-group">
                                    <label>Дата рождения</label>
                                    <input 
                                        type="date" 
                                        value={formData.birth_date}
                                        onChange={(e) => handleFormChange('birth_date', e.target.value)}
                                    />
                                </div>
                                ) : ('')}

                                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                                <div className="form-group">
                                    <label>Город</label>
                                    <select 
                                        value={formData.city}
                                        onChange={(e) => handleFormChange('city', e.target.value)}
                                    >
                                        <option value="">Выберите город</option>
                                        {CITIES.map(city => (
                                            <option key={city.value} value={city.value}>
                                                {city.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                ) : ('')}

                                {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                                <div className="form-group full-width">
                                    <label>О себе</label>
                                    <textarea 
                                        value={formData.about}
                                        onChange={(e) => handleFormChange('about', e.target.value)}
                                        placeholder="Расскажите о себе"
                                        rows="4"
                                    />
                                </div>
                                ) : ('')}
                            </div>
                        </div>
                        {/* Профессиональная информация */}
                        {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).user_type === 'applicant' ? (
                            <div className="settings-section">
                                <h3 className="settings-title">Профессиональная информация</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Профессия</label>
                                        <select 
                                            value={formData.profession}
                                            onChange={(e) => handleFormChange('profession', e.target.value)}
                                        >
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
                                            value={formData.experience_years}
                                            onChange={(e) => handleFormChange('experience_years', e.target.value)}
                                            min="0" 
                                            max="50" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ожидаемая зарплата</label>
                                        <input 
                                            type="number" 
                                            value={formData.expected_salary}
                                            onChange={(e) => handleFormChange('expected_salary', e.target.value)}
                                            placeholder="Введите сумму" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Образование</label>
                                        <input 
                                            type="text" 
                                            value={formData.education}
                                            onChange={(e) => handleFormChange('education', e.target.value)}
                                            placeholder="Введите образование" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Поля для работодателя
                            <div className="settings-section">
                                <h3 className="settings-title">Информация о компании</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Название компании</label>
                                        <input type="text" value={formData.company_name} onChange={(e) => handleFormChange('company_name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Город</label>
                                        <select value={formData.company_city} onChange={(e) => handleFormChange('company_city', e.target.value)}>
                                            <option value="">Выберите город</option>
                                            {CITIES.map(city => (
                                                <option key={city.value} value={city.value}>{city.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Описание компании</label>
                                        <textarea value={formData.company_description} onChange={(e) => handleFormChange('company_description', e.target.value)} rows="4" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Безопасность */}
                        <div className="settings-section">
                            <h3 className="settings-title">Безопасность</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Текущий пароль</label>
                                    <input 
                                        type="password" 
                                        value={passwordData.current_password}
                                        onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                                        placeholder="Введите текущий пароль" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Новый пароль</label>
                                    <input 
                                        type="password" 
                                        value={passwordData.new_password}
                                        onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                                        placeholder="Введите новый пароль" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Подтверждение пароля</label>
                                    <input 
                                        type="password" 
                                        value={passwordData.confirm_password}
                                        onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                                        placeholder="Повторите новый пароль" 
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <button 
                                    className="btn btn-outline" 
                                    onClick={handleSavePassword}
                                    disabled={saving}
                                >
                                    {saving ? 'Сохранение...' : 'Изменить пароль'}
                                </button>
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
                                onClick={handleSaveProfile}
                                disabled={saving}
                            >
                                Сохранить изменения
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={handleCancelChanges}
                            >   
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Работодатель - Вакансии */}
            {activeTab === 'vacancies' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Мои вакансии</h2>
                            <button className="btn" onClick={() => showMessage('Создание вакансии (демо-режим)')}>
                                + Создать вакансию
                            </button>
                        </div>
                        <div className="items-list">
                            {employerVacancies.length === 0 ? (
                                <div className="empty-state">
                                    <p className="empty-state-p">У вас пока нет вакансий :\</p>
                                    <button className="btn" onClick={() => showMessage('Создать вакансию')}>
                                        Создать первую вакансию
                                    </button>
                                </div>
                            ) : (
                                employerVacancies.map(vacancy => (
                                    <div key={vacancy.id} className="item-card">
                                        <div className="item-header">
                                            <span className="item-title">{vacancy.title}</span>
                                            <span className={`item-status ${vacancy.is_active ? 'status-active' : 'status-inactive'}`}>
                                                {vacancy.is_active ? 'Активна' : 'Неактивна'}
                                            </span>
                                        </div>
                                        <div className="item-meta">
                                            {vacancy.city} • {vacancy.employment_type === 'full-time' ? 'Полная занятость' : vacancy.employment_type}
                                        </div>
                                        <div className="item-meta">
                                            {vacancy.salary_from && vacancy.salary_to 
                                                ? `${vacancy.salary_from.toLocaleString()} - ${vacancy.salary_to.toLocaleString()} ₽`
                                                : vacancy.salary_from ? `от ${vacancy.salary_from.toLocaleString()} ₽`
                                                : vacancy.salary_to ? `до ${vacancy.salary_to.toLocaleString()} ₽`
                                                : 'з/п не указана'}
                                        </div>
                                        <div className="vacancy-description">
                                            {vacancy.description?.substring(0, 150)}...
                                        </div>
                                        <div className="item-actions">
                                            <button className="item-action-btn" onClick={() => showMessage('Редактировать вакансию (демо)')}>
                                                Редактировать
                                            </button>
                                            <button className="item-action-btn" onClick={() => showMessage('Деактивировать вакансию (демо)')}>
                                                {vacancy.is_active ? 'Деактивировать' : 'Активировать'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Работодатель - Полученные отклики */}
            {activeTab === 'received-responses' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Отклики на вакансии</h2>
                        </div>
                        <div className="items-list">
                            {employerResponses.length === 0 ? (
                                <div className="empty-state">
                                    <p className="empty-state-p">Пока нет откликов на ваши вакансии</p>
                                </div>
                            ) : (
                                employerResponses.map(response => {
                                    const statusInfo = formatResponseStatus(response.status);
                                    return (
                                        <div key={response.response_id} className="item-card">
                                            <div className="item-header">
                                                <span className="item-title">{response.vacancy_title}</span>
                                                <span className={`item-status ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div className="item-company">
                                                {response.first_name} {response.last_name} • {response.profession_name || 'Профессия не указана'}
                                            </div>
                                            <div className="item-meta">
                                                {response.email} • {response.phone || 'Телефон не указан'}
                                            </div>
                                            <div className="item-meta">
                                                Ожидаемая зарплата: {response.expected_salary ? `${response.expected_salary.toLocaleString()} ₽` : 'не указана'} • Опыт: {response.experience_years || 0} лет
                                            </div>
                                            {response.cover_letter && (
                                                <div className="vacancy-description">
                                                    💬 {response.cover_letter}
                                                </div>
                                            )}
                                            <div className="item-meta" style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                                Отклик получен: {new Date(response.response_date).toLocaleDateString('ru-RU')}
                                            </div>
                                            <div className="item-actions">
                                                <button className="item-action-btn" onClick={() => showMessage('Просмотреть резюме кандидата (демо)')}>
                                                    Просмотреть резюме
                                                </button>
                                                {response.status === 'pending' && (
                                                    <>
                                                        <button className="item-action-btn" onClick={() => showMessage('Принять отклик (демо)')}>
                                                            Принять
                                                        </button>
                                                        <button className="item-action-btn" onClick={() => showMessage('Отклонить отклик (демо)')}>
                                                            Отклонить
                                                        </button>
                                                    </>
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

            {/* Работодатель - Отправленные приглашения */}
            {activeTab === 'sent-invites' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Отправленные приглашения</h2>
                        </div>
                        <div className="items-list">
                            {employerResumeResponses.length === 0 ? (
                                <div className="empty-state">
                                    <p className="empty-state-p">Вы еще не отправляли приглашения</p>
                                </div>
                            ) : (
                                employerResumeResponses.map(invite => {
                                    const statusInfo = formatResponseStatus(invite.status);
                                    return (
                                        <div key={invite.id} className="item-card">
                                            <div className="item-header">
                                                <span className="item-title">{invite.resume_title}</span>
                                                <span className={`item-status ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div className="item-company">
                                                {invite.first_name} {invite.last_name} • {invite.profession_name || 'Профессия не указана'}
                                            </div>
                                            <div className="item-meta">
                                                {invite.email} • {invite.phone || 'Телефон не указан'}
                                            </div>
                                            <div className="vacancy-description">
                                                💬 {invite.message || 'Приглашение без сопроводительного текста'}
                                            </div>
                                            <div className="item-meta" style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                                                Отправлено: {new Date(invite.created_at).toLocaleDateString('ru-RU')}
                                            </div>
                                            <div className="item-actions">
                                                <button className="item-action-btn" onClick={() => showMessage('Отменить приглашение (демо)')}>
                                                    Отменить
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
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