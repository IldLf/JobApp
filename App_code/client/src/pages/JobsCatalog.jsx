import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/JobsCatalog.css';

// --- ПОЛНЫЕ ДАННЫЕ ИЗ ОРИГИНАЛЬНОЙ ВЕРСТКИ ---
const FILTERS_PROFESSIONS = [
    'Все профессии', 'Python разработчик', 'Java разработчик', 'JavaScript разработчик',
    'Frontend разработчик', 'Backend разработчик', 'Fullstack разработчик', 'DevOps инженер',
    'Системный администратор', 'Аналитик данных', 'Data Scientist', 'Project Manager',
    'Product Manager', 'UI/UX дизайнер', 'Графический дизайнер', 'Менеджер по продажам',
    'HR менеджер', 'Тестировщик', 'Android разработчик', 'iOS разработчик', 'SEO специалист'
];
const FILTERS_CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Самара'];
const FILTERS_EXPERIENCE = ['Нет опыта', '1-3 года', '3-5 лет', 'Более 5 лет'];
const FILTERS_TYPE = ['Полная занятость', 'Частичная занятость', 'Проектная работа', 'Стажировка'];

const VACANCIES = [
    { id: 1, title: 'Python разработчик в Яндекс', salary: '200 000 - 350 000 ₽', company: 'Яндекс', city: 'Москва', desc: 'Разработка высоконагруженных сервисов на Python. Требуемый опыт: 3-5 лет.', tags: ['3-5 лет', 'full-time', 'Python', 'Django'], expTag: '3-5 лет' },
    { id: 2, title: 'Frontend разработчик (React)', salary: '150 000 - 250 000 ₽', company: 'Mail.ru Group', city: 'Москва', desc: 'Разработка интерфейсов на React. Опыт работы от 2 лет.', tags: ['2-3 года', 'full-time', 'React', 'Vue.js'], expTag: '2-3 года' },
    { id: 3, title: 'Data Scientist', salary: '250 000 - 400 000 ₽', company: 'Сбер', city: 'Москва', desc: 'Разработка моделей машинного обучения. Опыт работы от 4 лет.', tags: ['4-6 лет', 'full-time', 'ML', 'Python'], expTag: '4-6 лет' },
    { id: 4, title: 'DevOps инженер', salary: '200 000 - 350 000 ₽', company: 'Ozon', city: 'Москва', desc: 'Поддержка инфраструктуры, CI/CD. Опыт работы от 3 лет.', tags: ['3-5 лет', 'full-time', 'Kubernetes', 'CI/CD'], expTag: '3-5 лет' },
    { id: 5, title: 'UX/UI дизайнер', salary: '130 000 - 220 000 ₽', company: 'Wildberries', city: 'Москва', desc: 'Проектирование интерфейсов для маркетплейса. Опыт работы от 2 лет.', tags: ['2-4 года', 'full-time', 'Figma', 'UI/UX'], expTag: '2-4 года' },
    { id: 6, title: 'Java разработчик', salary: '180 000 - 300 000 ₽', company: 'Ozon', city: 'Москва', desc: 'Разработка бэкенда для маркетплейса. Опыт работы от 3 лет.', tags: ['3-5 лет', 'full-time', 'Java', 'Spring'], expTag: '3-5 лет' }
];

const RESUMES = [
    { id: 1, name: 'Иван Иванов', profession: 'Senior Python разработчик', info: 'Москва • 5 лет опыта • 150 000 ₽', desc: 'Опытный Python разработчик, специализируюсь на веб-приложениях. МГУ, Прикладная математика.', skills: ['Python', 'Django', 'FastAPI', 'SQL'] },
    { id: 2, name: 'Петр Петров', profession: 'Frontend разработчик', info: 'Санкт-Петербург • 3 года опыта • 120 000 ₽', desc: 'Frontend разработчик, React, Vue.js. ИТМО, Программная инженерия.', skills: ['React', 'Vue.js', 'JavaScript', 'HTML/CSS'] },
    { id: 3, name: 'Анна Смирнова', profession: 'Data Scientist', info: 'Москва • 6 лет опыта • 200 000 ₽', desc: 'Data Scientist, машинное обучение и анализ данных. МФТИ, Прикладная математика и физика.', skills: ['Python', 'ML', 'SQL', 'Pandas'] },
    { id: 4, name: 'Елена Козлова', profession: 'UI/UX дизайнер', info: 'Казань • 4 года опыта • 90 000 ₽', desc: 'UI/UX дизайнер, создаю удобные интерфейсы. КФУ, Дизайн.', skills: ['Figma', 'UI/UX', 'Sketch', 'Adobe XD'] },
    { id: 5, name: 'Дмитрий Соколов', profession: 'Fullstack разработчик', info: 'Новосибирск • 5 лет опыта • 160 000 ₽', desc: 'Fullstack разработчик, Python + JavaScript. НГУ, Информатика.', skills: ['Python', 'JavaScript', 'Django', 'React'] }
];
// ----------------------------------------

const JobsCatalog = ({user, onLogout}) => {
    const [activeSection, setActiveSection] = useState('vacancies');
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleApplyFilters = () => {
        showMessage('Фильтры применены (демо-режим)', 'info');
    };

    return (
        <div className="main-container">
            <Header user={user} onLogout={onLogout} />

            {/* Строка поиска */}
            <div className="search-section">
                <h2 className="search-title">Поиск вакансий и резюме</h2>
                <input type="text" className="search-input" placeholder="Введите профессию, навыки или ключевые слова..." />
                <div className="search-hint">Например: Python разработчик, аналитик данных, дизайнер</div>
            </div>

            {/* Два столбца */}
            <div className="content-columns">

                {/* Фильтры */}
                <div className="filters-section">
                    <h3 className="filters-title">Фильтры</h3>

                    <div className="filter-group">
                        <label className="filter-label">Профессия</label>
                        <select className="filter-select">
                            {FILTERS_PROFESSIONS.map((prof, i) => (
                                <option key={i} value={i === 0 ? "" : i}>{prof}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Город</label>
                        <select className="filter-select">
                            {FILTERS_CITIES.map((city, i) => (
                                <option key={i} value={i === 0 ? "" : city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Опыт работы</label>
                        {FILTERS_EXPERIENCE.map((exp, i) => (
                            <div key={i} className="filter-checkbox">
                                <input type="checkbox" id={`exp-${i}`} />
                                <label htmlFor={`exp-${i}`}>{exp}</label>
                            </div>
                        ))}
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Зарплата</label>
                        <div className="salary-range">
                            <input type="number" className="filter-input" placeholder="От" min="0" />
                            <input type="number" className="filter-input" placeholder="До" min="0" />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Тип занятости</label>
                        {FILTERS_TYPE.map((type, i) => (
                            <div key={i} className="filter-checkbox">
                                <input type="checkbox" id={`type-${i}`} />
                                <label htmlFor={`type-${i}`}>{type}</label>
                            </div>
                        ))}
                    </div>

                    <button className="apply-filters-btn" onClick={handleApplyFilters}>Применить фильтры</button>
                </div>

                {/* Список вакансий/резюме */}
                <div className="vacancies-section">
                    <div className="section-tabs">
                        <button className={`section-tab ${activeSection === 'vacancies' ? 'active' : ''}`} onClick={() => setActiveSection('vacancies')}>Вакансии</button>
                        <button className={`section-tab ${activeSection === 'resumes' ? 'active' : ''}`} onClick={() => setActiveSection('resumes')}>Резюме</button>
                    </div>

                    {/* Вакансии */}
                    {activeSection === 'vacancies' && (
                        <div className="vacancies-list">
                            {VACANCIES.map(vac => (
                                <div key={vac.id} className="vacancy-card" onClick={() => showMessage('Для просмотра детальной информации войдите в личный кабинет')}>
                                    <div className="vacancy-header">
                                        <span className="vacancy-title">{vac.title}</span>
                                        <span className="vacancy-salary">{vac.salary}</span>
                                    </div>
                                    <div className="vacancy-company">{vac.company} • {vac.city}</div>
                                    <div className="vacancy-description">{vac.desc}</div>
                                    <div className="vacancy-tags">
                                        <span className="vacancy-tag experience">{vac.expTag}</span>
                                        {vac.tags.filter(t => t !== vac.expTag).map(tag => (
                                            <span key={tag} className="vacancy-tag">{tag}</span>
                                        ))}
                                    </div>
                                    <button className="response-btn" onClick={(e) => { e.stopPropagation(); showMessage('Отклик отправлен (демо-режим)', 'success'); }}>Откликнуться</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Резюме */}
                    {activeSection === 'resumes' && (
                        <div className="vacancies-list">
                            {RESUMES.map(resume => (
                                <div key={resume.id} className="resume-card" onClick={() => showMessage('Для просмотра детальной информации войдите в личный кабинет')}>
                                    <div className="resume-name">{resume.name}</div>
                                    <div className="resume-profession">{resume.profession}</div>
                                    <div className="resume-info">{resume.info}</div>
                                    <div className="vacancy-description">{resume.desc}</div>
                                    <div className="resume-skills">
                                        {resume.skills.map(skill => (
                                            <span key={skill} className="resume-skill">{skill}</span>
                                        ))}
                                    </div>
                                    <button className="response-btn" onClick={(e) => { e.stopPropagation(); showMessage('Приглашение отправлено (демо-режим)', 'success'); }}>Откликнуться</button>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>

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