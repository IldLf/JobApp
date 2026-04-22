import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import catalogService from '../services/catalogService';
import '../styles/JobsCatalog.css';
import '../styles/ResponseModal.css';

const JobsCatalog = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState('vacancies');
    const [vacancies, setVacancies] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [professions, setProfessions] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userResumes, setUserResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');

    // Пагинация
    const [vacancyPagination, setVacancyPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [resumePagination, setResumePagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    // Раздельные фильтры для вакансий и резюме
    const [vacancyFilters, setVacancyFilters] = useState({
        profession_id: 'all',
        city: 'all',
        experience: 'all',
        salary_from: '',
        salary_to: '',
        employment_type: 'all'
    });

    const [resumeFilters, setResumeFilters] = useState({
        profession_id: 'all',
        experience: 'all',
        salary_from: '',
        salary_to: ''
    });

    // Города только для вакансий
    const [vacancyCities, setVacancyCities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

    // Состояние для модального окна отклика
    const [responseModal, setResponseModal] = useState({
        isOpen: false,
        type: null,
        targetId: null,
        targetTitle: '',
        coverLetter: ''
    });
    const [sending, setSending] = useState(false);

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        const loadUserResumes = async () => {
            if (user && user.user_type === 'applicant') {
                const resumes = await catalogService.getUserResumes(user.id);
                setUserResumes(resumes);
                if (resumes.length > 0) {
                    setSelectedResumeId(resumes[0].id);
                }
            }
        };
        loadUserResumes();
    }, [user]);

    // Загрузка данных для фильтров
    useEffect(() => {
        const loadFiltersData = async () => {
            const [professionsData, vacancyCitiesData] = await Promise.all([
                catalogService.getProfessions(),
                catalogService.getVacancyCities()
            ]);
            setProfessions(professionsData);
            setVacancyCities(vacancyCitiesData);
        };
        loadFiltersData();
    }, []);

    // Загрузка вакансий при изменении фильтров вакансий или страницы
    useEffect(() => {
        const loadVacancies = async () => {
            setLoading(true);
            const result = await catalogService.getVacancies(
                vacancyFilters,
                vacancyPagination.currentPage,
                5,
                searchQuery
            );
            setVacancies(result.vacancies || []);
            setVacancyPagination({
                currentPage: result.page,
                totalPages: result.totalPages,
                total: result.total
            });
            setLoading(false);
        };

        if (activeSection === 'vacancies') {
            loadVacancies();
        }
    }, [activeSection, vacancyFilters, vacancyPagination.currentPage, searchQuery]);

    // Загрузка резюме при изменении фильтров резюме или страницы
    useEffect(() => {
        const loadResumes = async () => {
            setLoading(true);
            const result = await catalogService.getResumes(
                resumeFilters,
                resumePagination.currentPage,
                5,
                searchQuery
            );
            setResumes(result.resumes || []);
            setResumePagination({
                currentPage: result.page,
                totalPages: result.totalPages,
                total: result.total
            });
            setLoading(false);
        };

        if (activeSection === 'resumes') {
            loadResumes();
        }
    }, [activeSection, resumeFilters, resumePagination.currentPage, searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // Сбрасываем на первую страницу при изменении поиска
        if (activeSection === 'vacancies') {
            setVacancyPagination(prev => ({ ...prev, currentPage: 1 }));
        } else {
            setResumePagination(prev => ({ ...prev, currentPage: 1 }));
        }
    };

    const handleVacancyFilterChange = (key, value) => {
        setVacancyFilters(prev => ({ ...prev, [key]: value }));
        // Сбрасываем на первую страницу при изменении фильтров
        setVacancyPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleResumeFilterChange = (key, value) => {
        setResumeFilters(prev => ({ ...prev, [key]: value }));
        // Сбрасываем на первую страницу при изменении фильтров
        setResumePagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleApplyVacancyFilters = () => {
        showMessage('Фильтры вакансий применены', 'success');
    };

    const handleApplyResumeFilters = () => {
        showMessage('Фильтры резюме применены', 'success');
    };

    const handleResetVacancyFilters = () => {
        setVacancyFilters({
            profession_id: 'all',
            city: 'all',
            experience: 'all',
            salary_from: '',
            salary_to: '',
            employment_type: 'all'
        });
        setVacancyPagination(prev => ({ ...prev, currentPage: 1 }));
        showMessage('Фильтры вакансий сброшены', 'info');
    };

    const handleResetResumeFilters = () => {
        setResumeFilters({
            profession_id: 'all',
            experience: 'all',
            salary_from: '',
            salary_to: ''
        });
        setResumePagination(prev => ({ ...prev, currentPage: 1 }));
        showMessage('Фильтры резюме сброшены', 'info');
    };

    // Функции для смены страницы
    const goToPrevPage = () => {
        if (activeSection === 'vacancies' && vacancyPagination.currentPage > 1) {
            setVacancyPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        } else if (activeSection === 'resumes' && resumePagination.currentPage > 1) {
            setResumePagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        }
    };

    const goToNextPage = () => {
        if (activeSection === 'vacancies' && vacancyPagination.currentPage < vacancyPagination.totalPages) {
            setVacancyPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        } else if (activeSection === 'resumes' && resumePagination.currentPage < resumePagination.totalPages) {
            setResumePagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        }
    };

    const goToPage = (page) => {
        if (activeSection === 'vacancies') {
            setVacancyPagination(prev => ({ ...prev, currentPage: page }));
        } else {
            setResumePagination(prev => ({ ...prev, currentPage: page }));
        }
    };

    // Открытие модального окна для отклика
    const openResponseModal = (type, targetId, targetTitle) => {
        setResponseModal({
            isOpen: true,
            type,
            targetId,
            targetTitle,
            coverLetter: ''
        });
        if (userResumes.length > 0) {
            setSelectedResumeId(userResumes[0].id);
        }
    };

    // Закрытие модального окна
    const closeResponseModal = () => {
        setResponseModal({
            isOpen: false,
            type: null,
            targetId: null,
            targetTitle: '',
            coverLetter: ''
        });
    };

    // Отправка отклика
    const handleSendResponse = async () => {
        if (!responseModal.coverLetter.trim()) {
            showMessage('Пожалуйста, напишите сопроводительное письмо', 'error');
            return;
        }

        if (responseModal.type === 'vacancy' && !selectedResumeId) {
            showMessage('Пожалуйста, выберите резюме для отклика', 'error');
            return;
        }

        setSending(true);

        let result;
        if (responseModal.type === 'vacancy') {
            result = await catalogService.respondToVacancyWithResume(
                responseModal.targetId,
                user?.id,
                selectedResumeId,
                responseModal.coverLetter
            );
        } else {
            result = await catalogService.respondToResume(
                responseModal.targetId,
                user?.id,
                responseModal.coverLetter
            );
        }

        if (result.success) {
            showMessage(result.message, 'success');
            closeResponseModal();
        } else {
            showMessage(result.error || 'Ошибка при отправке', 'error');
        }

        setSending(false);
    };

    // Проверка, может ли пользователь откликаться
    const canRespondToVacancy = () => {
        return user && user.user_type === 'applicant' && user.is_active === 1;
    };

    const canRespondToResume = () => {
        return user && user.user_type === 'employer' && user.is_active === 1;
    };

    // Получаем текущие фильтры в зависимости от активной вкладки
    const currentFilters = activeSection === 'vacancies' ? vacancyFilters : resumeFilters;
    const currentPagination = activeSection === 'vacancies' ? vacancyPagination : resumePagination;
    const handleFilterChange = activeSection === 'vacancies' ? handleVacancyFilterChange : handleResumeFilterChange;
    const handleApplyFilters = activeSection === 'vacancies' ? handleApplyVacancyFilters : handleApplyResumeFilters;
    const handleResetFilters = activeSection === 'vacancies' ? handleResetVacancyFilters : handleResetResumeFilters;

    // Функция для отображения номеров страниц
    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPagination.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(currentPagination.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`pagination-page ${currentPagination.currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="main-container">
            <Header user={user} onLogout={onLogout} />

            {/* Строка поиска */}
            <div className="search-section">
                <h2 className="search-title">Поиск вакансий и резюме</h2>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Введите профессию, навыки или ключевые слова..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="search-hint">Например: Python разработчик, аналитик данных, дизайнер</div>
            </div>

            {/* Два столбца */}
            <div className="content-columns">

                {/* Фильтры */}
                <div className="filters-section">
                    <h3 className="filters-title">
                        {activeSection === 'vacancies' ? 'Фильтры вакансий' : 'Фильтры резюме'}
                    </h3>

                    <div className="filter-group">
                        <label className="filter-label">Профессия</label>
                        <select
                            className="filter-select"
                            value={currentFilters.profession_id}
                            onChange={(e) => handleFilterChange('profession_id', e.target.value)}
                        >
                            <option value="all">Все профессии</option>
                            {professions.map(prof => (
                                <option key={prof.id} value={prof.id}>{prof.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Город - только для вакансий */}
                    {activeSection === 'vacancies' && (
                        <div className="filter-group">
                            <label className="filter-label">Город</label>
                            <select
                                className="filter-select"
                                value={vacancyFilters.city}
                                onChange={(e) => handleVacancyFilterChange('city', e.target.value)}
                            >
                                <option value="all">Все города</option>
                                {vacancyCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label className="filter-label">Опыт работы</label>
                        {['Нет опыта', '1-3 года', '3-5 лет', 'Более 5 лет'].map((exp, i) => (
                            <div key={i} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    id={`exp-${i}`}
                                    checked={currentFilters.experience === exp}
                                    onChange={() => handleFilterChange('experience', currentFilters.experience === exp ? 'all' : exp)}
                                />
                                <label htmlFor={`exp-${i}`}>{exp}</label>
                            </div>
                        ))}
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Зарплата</label>
                        <div className="salary-range">
                            <input
                                type="number"
                                className="filter-input"
                                placeholder="От"
                                min="0"
                                value={currentFilters.salary_from}
                                onChange={(e) => handleFilterChange('salary_from', e.target.value)}
                            />
                            <input
                                type="number"
                                className="filter-input"
                                placeholder="До"
                                min="0"
                                value={currentFilters.salary_to}
                                onChange={(e) => handleFilterChange('salary_to', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Тип занятости - только для вакансий */}
                    {activeSection === 'vacancies' && (
                        <div className="filter-group">
                            <label className="filter-label">Тип занятости</label>
                            {['Полная занятость', 'Частичная занятость', 'Проектная работа', 'Стажировка'].map((type, i) => (
                                <div key={i} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`type-${i}`}
                                        checked={vacancyFilters.employment_type === type}
                                        onChange={() => handleVacancyFilterChange('employment_type', vacancyFilters.employment_type === type ? 'all' : type)}
                                    />
                                    <label htmlFor={`type-${i}`}>{type}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="apply-filters-btn" onClick={handleApplyFilters}>
                            Применить фильтры
                        </button>
                        <button className="apply-filters-btn" onClick={handleResetFilters} style={{ background: '#6c757d' }}>
                            Сбросить
                        </button>
                    </div>
                </div>

                {/* Список вакансий/резюме */}
                <div className="vacancies-section">
                    <div className="section-tabs">
                        <button
                            className={`section-tab ${activeSection === 'vacancies' ? 'active' : ''}`}
                            onClick={() => setActiveSection('vacancies')}
                        >
                            Вакансии
                        </button>
                        <button
                            className={`section-tab ${activeSection === 'resumes' ? 'active' : ''}`}
                            onClick={() => setActiveSection('resumes')}
                        >
                            Резюме
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>
                    ) : (
                        <>
                            {/* Вакансии */}
                            {activeSection === 'vacancies' && (
                                <>
                                    <div className="vacancies-list">
                                        {vacancies.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>Нет вакансий, соответствующих фильтрам</div>
                                        ) : (
                                            vacancies.map(vac => (
                                                <div key={vac.id} className="vacancy-card">
                                                    <div className="vacancy-header" 
                                                        onClick={(e) => { e.stopPropagation(); // чтобы не сработало дважды
                                                                            navigate(`/vacancy/${vac.id}`); }}
                                                        style={{ cursor: 'pointer' }}>
                                                        <span className="vacancy-title">{vac.title}</span>
                                                        <span className="vacancy-salary">
                                                            {vac.salary_from && vac.salary_to ? `${vac.salary_from} - ${vac.salary_to} ₽` :
                                                                vac.salary_from ? `от ${vac.salary_from} ₽` :
                                                                    vac.salary_to ? `до ${vac.salary_to} ₽` : 'з/п не указана'}
                                                        </span>
                                                    </div>
                                                    <div className="vacancy-company">{vac.Company?.name || 'Компания'} • {vac.city || 'Не указан'}</div>
                                                    <div className="vacancy-description">{vac.description?.substring(0, 100)}...</div>
                                                    <div className="vacancy-tags">
                                                        {vac.experience_required && (
                                                            <span className="vacancy-tag experience">{vac.experience_required}</span>
                                                        )}
                                                        {vac.employment_type && (
                                                            <span className="vacancy-tag type">{vac.employment_type_display}</span>
                                                        )}
                                                        {vac.Profession && (
                                                            <span className="vacancy-tag">{vac.Profession.name}</span>
                                                        )}
                                                    </div>
                                                    {canRespondToVacancy() && (
                                                        <button
                                                            className="response-btn"
                                                            onClick={() => openResponseModal('vacancy', vac.id, vac.title)}
                                                        >
                                                            Откликнуться
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Пагинация для вакансий */}
                                    {vacancyPagination.totalPages > 0 && (
                                        <div className="pagination">
                                            <button
                                                onClick={goToPrevPage}
                                                disabled={vacancyPagination.currentPage === 1}
                                                className="pagination-btn"
                                            >
                                                ← Назад
                                            </button>
                                            <div className="pagination-pages">
                                                {renderPageNumbers()}
                                            </div>
                                            <button
                                                onClick={goToNextPage}
                                                disabled={vacancyPagination.currentPage === vacancyPagination.totalPages}
                                                className="pagination-btn"
                                            >
                                                Вперед →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Резюме */}
                            {activeSection === 'resumes' && (
                                <>
                                    <div className="vacancies-list">
                                        {resumes.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>Нет резюме, соответствующих фильтрам</div>
                                        ) : (
                                            resumes.map(resume => {
                                                const userInfo = resume.Applicant?.User;
                                                const fullName = userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() : 'Пользователь';

                                                return (
                                                    <div key={resume.id} className="resume-card" style={{background: 'white'}}>
                                                        <div className="resume-name" 
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => navigate(`/resume/${resume.id}`)}>{fullName}</div>
                                                        <div className="resume-profession">{resume.title}</div>
                                                        <div className="resume-info">
                                                            {resume.experience || 'Опыт не указан'} •
                                                            {resume.salary ? `${resume.salary} ₽` : 'з/п не указана'}
                                                        </div>
                                                        <div className="vacancy-description">{resume.about?.substring(0, 100)}...</div>
                                                        <div className="resume-skills">
                                                            {resume.Profession && (
                                                                <span className="resume-skill">{resume.Profession.name}</span>
                                                            )}
                                                        </div>
                                                        {canRespondToResume() && (
                                                            <button
                                                                className="response-btn"
                                                                onClick={() => openResponseModal('resume', resume.id, resume.title)}
                                                            >
                                                                Пригласить
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Пагинация для резюме */}
                                    {resumePagination.totalPages > 0 && (
                                        <div className="pagination">
                                            <button
                                                onClick={goToPrevPage}
                                                disabled={resumePagination.currentPage === 1}
                                                className="pagination-btn"
                                            >
                                                ← Назад
                                            </button>
                                            <div className="pagination-pages">
                                                {renderPageNumbers()}
                                            </div>
                                            <button
                                                onClick={goToNextPage}
                                                disabled={resumePagination.currentPage === resumePagination.totalPages}
                                                className="pagination-btn"
                                            >
                                                Вперед →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Модальное окно для отклика */}
            {responseModal.isOpen && (
                <div className="response-modal-overlay" onClick={closeResponseModal}>
                    <div className="response-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Отклик на {responseModal.type === 'vacancy' ? 'вакансию' : 'резюме'}</h3>
                        <p className="response-modal-target">{responseModal.targetTitle}</p>

                        {/* Выбор резюме - только для отклика на вакансию */}
                        {responseModal.type === 'vacancy' && userResumes.length > 0 && (
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

                        {responseModal.type === 'vacancy' && userResumes.length === 0 && (
                            <div className="response-modal-warning">
                                ⚠️ У вас нет активных резюме.
                                <a href="/account">Создайте резюме</a> перед откликом.
                            </div>
                        )}

                        <textarea
                            className="response-modal-textarea"
                            placeholder="Напишите сопроводительное письмо..."
                            value={responseModal.coverLetter}
                            onChange={(e) => setResponseModal(prev => ({ ...prev, coverLetter: e.target.value }))}
                            rows={6}
                        />
                        <div className="response-modal-buttons">
                            <button
                                className="response-modal-btn response-modal-btn-cancel"
                                onClick={closeResponseModal}
                                disabled={sending}
                            >
                                Отмена
                            </button>
                            <button
                                className="response-modal-btn response-modal-btn-submit"
                                onClick={handleSendResponse}
                                disabled={sending || (responseModal.type === 'vacancy' && userResumes.length === 0)}
                            >
                                {sending ? 'Отправка...' : 'Отправить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Всплывающее уведомление */}
            {message.visible && (
                <div className={`message ${message.type}`} style={{ display: 'block', position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default JobsCatalog;