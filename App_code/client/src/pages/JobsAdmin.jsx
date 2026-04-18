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
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    // Загрузка данных
    useEffect(() => {
        loadData();
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
                    // Режим блокировки/разблокировки
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
                    // Режим верификации (только для employer)
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

                {/* Поиск */}
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
                </div>

                {/* Список */}
                <>
                    <div className="admin-grid">
                        {items.length === 0 ? (
                            <div className="admin-empty">Нет элементов для отображения</div>
                        ) : (
                            items.map(item => {
                                if (activeTab === 'users') return renderUserCard(item);
                                if (activeTab === 'vacancies') return renderVacancyCard(item);
                                return renderResumeCard(item);
                            })
                        )}
                    </div>

                    {/* Пагинация */}
                    {pagination.totalPages > 0 && (
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