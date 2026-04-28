import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/JobsAdmin.css';

const JobsAdmin = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationMode, setVerificationMode] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    // Загрузка данных (не для статистики)
    useEffect(() => {
        if (activeTab !== 'stats') {
            loadData();
        }
    }, [activeTab, searchQuery, verificationMode, pagination.currentPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            let url = '';
            if (activeTab === 'users') {
                url = `http://localhost:5000/api/admin/users?search=${searchQuery}&verification_mode=${verificationMode}&page=${pagination.currentPage}&limit=10`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setItems(data.users);
                    setPagination({
                        currentPage: data.page,
                        totalPages: data.totalPages,
                        total: data.total
                    });
                }
            } else if (activeTab === 'vacancies') {
                url = `http://localhost:5000/api/admin/vacancies?search=${searchQuery}&verification_mode=${verificationMode}&page=${pagination.currentPage}&limit=10`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setItems(data.vacancies);
                    setPagination({
                        currentPage: data.page,
                        totalPages: data.totalPages,
                        total: data.total
                    });
                }
            } else if (activeTab === 'resumes') {
                url = `http://localhost:5000/api/admin/resumes?search=${searchQuery}&verification_mode=${verificationMode}&page=${pagination.currentPage}&limit=10`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.success) {
                    setItems(data.resumes);
                    setPagination({
                        currentPage: data.page,
                        totalPages: data.totalPages,
                        total: data.total
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showMessage('Ошибка загрузки данных', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        setStatsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            } else {
                showMessage('Ошибка загрузки статистики', 'error');
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            showMessage('Ошибка подключения к серверу', 'error');
        } finally {
            setStatsLoading(false);
        }
    };

    // Загрузка статистики только при переключении на вкладку stats
    useEffect(() => {
        if (activeTab === 'stats') {
            loadStats();
            // Очищаем items от предыдущих данных
            setItems([]);
        }
    }, [activeTab]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleVerificationToggle = () => {
        setVerificationMode(!verificationMode);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleStatusChange = async (itemId, newStatus) => {
        try {
            let url = '';
            if (activeTab === 'users') {
                url = `http://localhost:5000/api/admin/users/${itemId}/status`;
            } else if (activeTab === 'vacancies') {
                url = `http://localhost:5000/api/admin/vacancies/${itemId}/status`;
            } else {
                url = `http://localhost:5000/api/admin/resumes/${itemId}/status`;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                showMessage('Статус успешно обновлен', 'success');
                loadData();
            } else {
                showMessage(data.error || 'Ошибка обновления статуса', 'error');
            }
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            showMessage('Ошибка подключения к серверу', 'error');
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Заблокирован';
            case 1: return 'Активен';
            case 2: return 'Ожидает верификации';
            case 3: return 'Отклонен';
            default: return 'Неизвестно';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0: return 'status-blocked';
            case 1: return 'status-active';
            case 2: return 'status-pending';
            case 3: return 'status-rejected';
            default: return '';
        }
    };

    const renderUserCard = (user) => (
        <div key={user.id} className="admin-card">
            <div className="admin-card-header">
                <span className="admin-card-title">{user.first_name} {user.last_name}</span>
                <span className={`admin-card-status ${getStatusClass(user.is_active)}`}>
                    {getStatusText(user.is_active)}
                </span>
            </div>
            <div className="admin-card-details">
                <p>📧 {user.email}</p>
                <p>📱 {user.phone || 'Телефон не указан'}</p>
                <p>👤 Тип: {user.user_type === 'applicant' ? 'Соискатель' : user.user_type === 'employer' ? 'Работодатель' : 'Администратор'}</p>
                <p>📅 Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
            </div>
            <div className="admin-card-actions">
                {!verificationMode ? (
                    user.is_active === 0 ? (
                        <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(user.id, 1)}>
                            Разблокировать
                        </button>
                    ) : user.is_active === 1 && user.user_type !== 'admin' ? (
                        <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(user.id, 0)}>
                            Заблокировать
                        </button>
                    ) : null
                ) : (
                    user.user_type === 'employer' && (
                        <>
                            {user.is_active === 2 && (
                                <>
                                    <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(user.id, 1)}>
                                        Принять
                                    </button>
                                    <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(user.id, 3)}>
                                        Отклонить
                                    </button>
                                </>
                            )}
                            {user.is_active === 3 && (
                                <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(user.id, 2)}>
                                    Повторно рассмотреть
                                </button>
                            )}
                        </>
                    )
                )}
            </div>
        </div>
    );

    const renderVacancyCard = (vacancy) => (
        <div key={vacancy.id} className="admin-card">
            <div className="admin-card-header">
                <span className="admin-card-title">{vacancy.title}</span>
                <span className={`admin-card-status ${getStatusClass(vacancy.is_active)}`}>
                    {getStatusText(vacancy.is_active)}
                </span>
            </div>
            <div className="admin-card-details">
                <p>🏢 {vacancy.Company?.name || 'Компания не указана'}</p>
                <p>📍 {vacancy.city || 'Город не указан'}</p>
                <p>💰 {vacancy.salary_from && vacancy.salary_to ? `${vacancy.salary_from} - ${vacancy.salary_to} ₽` : vacancy.salary_from ? `от ${vacancy.salary_from} ₽` : vacancy.salary_to ? `до ${vacancy.salary_to} ₽` : 'з/п не указана'}</p>
                <p>📋 {vacancy.employment_type === 'full-time' ? 'Полная занятость' : vacancy.employment_type === 'part-time' ? 'Частичная занятость' : vacancy.employment_type === 'project' ? 'Проектная работа' : 'Стажировка'}</p>
                <p className="admin-card-description">{vacancy.description?.substring(0, 150)}...</p>
            </div>
            <div className="admin-card-actions">
                {!verificationMode ? (
                    vacancy.is_active === 0 ? (
                        <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(vacancy.id, 1)}>
                            Активировать
                        </button>
                    ) : vacancy.is_active === 1 ? (
                        <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(vacancy.id, 3)}>
                            Заблокировать
                        </button>
                    ) : null
                ) : (
                    <>
                        {vacancy.is_active === 2 && (
                            <>
                                <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(vacancy.id, 1)}>
                                    Принять
                                </button>
                                <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(vacancy.id, 3)}>
                                    Отклонить
                                </button>
                            </>
                        )}
                        {vacancy.is_active === 3 && (
                            <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(vacancy.id, 2)}>
                                Повторно рассмотреть
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    const renderResumeCard = (resume) => {
        const userInfo = resume.Applicant?.User;
        const fullName = userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() : 'Пользователь';

        return (
            <div key={resume.id} className="admin-card">
                <div className="admin-card-header">
                    <span className="admin-card-title">{resume.title}</span>
                    <span className={`admin-card-status ${getStatusClass(resume.is_active)}`}>
                        {getStatusText(resume.is_active)}
                    </span>
                </div>
                <div className="admin-card-details">
                    <p>👤 {fullName}</p>
                    <p>📧 {userInfo?.email || 'Email не указан'}</p>
                    <p>💰 {resume.salary ? `${resume.salary.toLocaleString()} ₽` : 'з/п не указана'}</p>
                    <p>📝 {resume.experience || 'Опыт не указан'}</p>
                    <p className="admin-card-description">{resume.about?.substring(0, 150)}...</p>
                </div>
                <div className="admin-card-actions">
                    {!verificationMode ? (
                        resume.is_active === 0 ? (
                            <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(resume.id, 1)}>
                                Активировать
                            </button>
                        ) : resume.is_active === 1 ? (
                            <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(resume.id, 3)}>
                                Заблокировать
                            </button>
                        ) : null
                    ) : (
                        <>
                            {resume.is_active === 2 && (
                                <>
                                    <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(resume.id, 1)}>
                                        Принять
                                    </button>
                                    <button className="admin-btn admin-btn-danger" onClick={() => handleStatusChange(resume.id, 3)}>
                                        Отклонить
                                    </button>
                                </>
                            )}
                            {resume.is_active === 3 && (
                                <button className="admin-btn admin-btn-success" onClick={() => handleStatusChange(resume.id, 2)}>
                                    Повторно рассмотреть
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const goToPrevPage = () => {
        if (pagination.currentPage > 1) {
            setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        }
    };

    const goToNextPage = () => {
        if (pagination.currentPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: i }))}
                    className={`admin-pagination-page ${pagination.currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    if (!user || user.user_type !== 'admin') {
        return (
            <div className="main-container">
                <Header user={user} onLogout={onLogout} />
                <div className="admin-access-denied">
                    <h2>Доступ запрещен</h2>
                    <p>У вас нет прав для доступа к этой странице.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <Header user={user} onLogout={onLogout} />

            <div className="admin-container">
                <h1 className="admin-title">Панель модерации</h1>



                {/* Табы */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Пользователи
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'vacancies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vacancies')}
                    >
                        Вакансии
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'resumes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        Резюме
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Статистика
                    </button>
                </div>

                {activeTab !== 'stats' && (
                    <div className="admin-search-section">
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <label className="admin-verification-toggle">
                            <input
                                type="checkbox"
                                checked={verificationMode}
                                onChange={handleVerificationToggle}
                            />
                            <span>Режим верификации</span>
                        </label>
                    </div>
                )}

                {/* Контент: Пользователи/Вакансии/Резюме */}
                {activeTab !== 'stats' && (
                    <>
                        <div className="admin-grid">
                            {items.length === 0 && !loading ? (
                                <div className="admin-empty">Нет элементов для отображения</div>
                            ) : (
                                items.map(item => {
                                    if (activeTab === 'users') return renderUserCard(item);
                                    if (activeTab === 'vacancies') return renderVacancyCard(item);
                                    return renderResumeCard(item);
                                })
                            )}
                        </div>

                        {/* {loading && <div className="admin-loading">Загрузка...</div>} */}

                        {pagination.totalPages > 0 && !loading && (
                            <div className="admin-pagination">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={pagination.currentPage === 1}
                                    className="admin-pagination-btn"
                                >
                                    ← Назад
                                </button>
                                <div className="admin-pagination-pages">
                                    {renderPageNumbers()}
                                </div>
                                <button
                                    onClick={goToNextPage}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="admin-pagination-btn"
                                >
                                    Вперед →
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Контент: Статистика */}
                {activeTab === 'stats' && (
                    <div className="admin-stats-container">
                        {statsLoading ? (
                            <div className="admin-loading">Загрузка статистики...</div>
                        ) : stats ? (
                            <>
                                {/* Общая статистика - 5 карточек в строку */}
                                <div className="stats-section-admin">
                                    <h3 className="stats-section-title">📊 Общая статистика</h3>
                                    <div className="stats-row">
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.activeVacancies}</div>
                                            <div className="stat-label">Активных вакансий</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.activeResumes}</div>
                                            <div className="stat-label">Активных резюме</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.totalUsers}</div>
                                            <div className="stat-label">Всего пользователей</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.totalEmployers}</div>
                                            <div className="stat-label">Работодателей</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.totalApplicants}</div>
                                            <div className="stat-label">Соискателей</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Статистика за 30 дней - 3 карточки в строку */}
                                <div className="stats-section-admin">
                                    <h3 className="stats-section-title">📈 За последние 30 дней</h3>
                                    <div className="stats-row">
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.newUsers}</div>
                                            <div className="stat-label">Новых пользователей</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.recentResponses}</div>
                                            <div className="stat-label">Откликов на вакансии</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{stats.recentResumeResponses}</div>
                                            <div className="stat-label">Приглашений от компаний</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Статистика откликов по статусам - 4 карточки в строку */}
                                <div className="stats-section-admin">
                                    <h3 className="stats-section-title">📋 Статусы откликов и приглашений</h3>
                                    <div className="stats-row">
                                        <div className="stat-card status-pending-card">
                                            <div className="stat-value">{stats.responsesByStatus.pending}</div>
                                            <div className="stat-label">На рассмотрении</div>
                                        </div>
                                        <div className="stat-card status-viewed-card">
                                            <div className="stat-value">{stats.responsesByStatus.viewed}</div>
                                            <div className="stat-label">Просмотрено</div>
                                        </div>
                                        <div className="stat-card status-accepted-card">
                                            <div className="stat-value">{stats.responsesByStatus.accepted}</div>
                                            <div className="stat-label">Принято</div>
                                        </div>
                                        <div className="stat-card status-rejected-card">
                                            <div className="stat-value">{stats.responsesByStatus.rejected}</div>
                                            <div className="stat-label">Отклонено</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="admin-empty">Не удалось загрузить статистику</div>
                        )}
                    </div>
                )}
            </div>

            {message.visible && (
                <div className={`message ${message.type}`} style={{ display: 'block', position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default JobsAdmin;