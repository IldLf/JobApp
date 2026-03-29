import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/JobsAccount.css';

// ============================================
// КОНСТАНТЫ ДАННЫХ
// ============================================

const USER_DATA = {
    name: 'Иван Иванов',
    firstName: 'Иван',
    lastName: 'Иванов',
    profession: 'Senior Python разработчик',
    city: 'Москва',
    email: 'ivan.ivanov@email.com',
    phone: '+7 (900) 123-45-67',
    birthDate: '1995-05-15',
    avatar: 'ИИ',
    about: 'Опытный Python разработчик, специализируюсь на веб-приложениях',
    experience: 5,
    salary: 150000,
    education: 'МГУ, Прикладная математика'
};

const STATS = [
    { label: 'Активных резюме', value: 3 },
    { label: 'Откликов на вакансии', value: 15 },
    { label: 'Просмотров резюме', value: 8 },
    { label: 'Приглашений', value: 4 }
];

const RESUMES = [
    { 
        id: 1, 
        title: 'Senior Python разработчик', 
        status: 'Активно', 
        statusClass: 'status-active', 
        meta: 'Москва • 180 000 ₽ • Опыт 5 лет', 
        desc: 'Разрабатывал высоконагруженные сервисы на Python, Django, FastAPI. МГУ, Прикладная математика.',
        actions: ['Редактировать', 'Повысить', 'Деактивировать', 'Статистика']
    },
    { 
        id: 2, 
        title: 'Fullstack разработчик', 
        status: 'Активно', 
        statusClass: 'status-active', 
        meta: 'Москва • 170 000 ₽ • Опыт 5 лет', 
        desc: 'Fullstack на Python и JavaScript. Разработка веб-приложений.',
        actions: ['Редактировать', 'Повысить', 'Деактивировать', 'Статистика']
    },
    { 
        id: 3, 
        title: 'Java разработчик', 
        status: 'Неактивно', 
        statusClass: 'status-inactive', 
        meta: 'Москва • 160 000 ₽ • Опыт 3 года', 
        desc: 'Java, Spring, Hibernate. Разработка корпоративных приложений.',
        actions: ['Редактировать', 'Активировать', 'Удалить']
    }
];

const RESPONSES = [
    { 
        id: 1, 
        title: 'Python разработчик', 
        status: 'Принято', 
        statusClass: 'status-accepted', 
        company: 'Яндекс • Москва', 
        meta: 'Отклик отправлен: 01.03.2026 • Зарплата: 200 000 - 350 000 ₽', 
        desc: 'Ваш отклик принят. Компания приглашает вас на собеседование.',
        actions: ['Подробнее', 'Написать']
    },
    { 
        id: 2, 
        title: 'Fullstack разработчик', 
        status: 'Просмотрено', 
        statusClass: 'status-viewed', 
        company: 'Ozon • Москва', 
        meta: 'Отклик отправлен: 05.03.2026 • Зарплата: 180 000 - 300 000 ₽', 
        desc: 'Компания просмотрела ваш отклик. Ожидайте решения.',
        actions: ['Подробнее', 'Отозвать']
    },
    { 
        id: 3, 
        title: 'Data Scientist', 
        status: 'На рассмотрении', 
        statusClass: 'status-pending', 
        company: 'Сбер • Москва', 
        meta: 'Отклик отправлен: 08.03.2026 • Зарплата: 250 000 - 400 000 ₽', 
        desc: '',
        actions: ['Подробнее', 'Отозвать']
    },
    { 
        id: 4, 
        title: 'DevOps инженер', 
        status: 'Отказ', 
        statusClass: 'status-rejected', 
        company: 'Тинькофф • Москва', 
        meta: 'Отклик отправлен: 06.03.2026 • Зарплата: 200 000 - 350 000 ₽', 
        desc: 'К сожалению, компания приняла решение отказать вам.',
        actions: ['Подробнее', 'Похожие вакансии']
    }
];

const INVITES = [
    { 
        id: 1, 
        title: 'Senior Python разработчик', 
        status: 'Принято', 
        statusClass: 'status-accepted', 
        company: 'Яндекс', 
        meta: 'Получено: 02.03.2026', 
        desc: 'Здравствуйте! Ваше резюме нас заинтересовало. Приглашаем вас на собеседование на позицию Senior Python разработчика.',
        actions: ['Подробнее', 'Связаться']
    },
    { 
        id: 2, 
        title: 'Fullstack разработчик', 
        status: 'Ожидает ответа', 
        statusClass: 'status-pending', 
        company: 'Avito', 
        meta: 'Получено: 09.03.2026', 
        desc: 'Ищем fullstack разработчика в команду. Готовы рассмотреть вашу кандидатуру.',
        actions: ['Принять', 'Отклонить', 'Связаться']
    },
    { 
        id: 3, 
        title: 'Tech Lead', 
        status: 'Просмотрено', 
        statusClass: 'status-viewed', 
        company: 'VK', 
        meta: 'Получено: 07.03.2026', 
        desc: 'Рассматриваем вас на позицию Tech Lead. Ждем вашего решения.',
        actions: ['Подробнее', 'Связаться']
    }
];

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

// ============================================
// КОМПОНЕНТ
// ============================================

const JobsAccount = ({user, onLogout}) => {
    const [activeTab, setActiveTab] = useState('resumes');
    const [message, setMessage] = useState({ text: '', type: 'info', visible: false });

    const showMessage = (text, type = 'info') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleAction = (action) => {
        showMessage(`${action} (демо-режим)`);
    };

    return (
        <div className="main-container">
            {/* Хедер */}
            <Header user={user} onLogout={onLogout} />

            {/* Профиль */}
            <div className="profile-section">
                <div className="profile-header">
                    <div className="profile-avatar">{USER_DATA.avatar}</div>
                    <div className="profile-title">
                        <h1>{USER_DATA.name}</h1>
                        <p>{USER_DATA.profession} • {USER_DATA.city}</p>
                        <p>{USER_DATA.email} • {USER_DATA.phone}</p>
                    </div>
                </div>

                <div className="profile-stats">
                    {STATS.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-number">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
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
                            {RESUMES.map(resume => (
                                <div key={resume.id} className="item-card">
                                    <div className="item-header">
                                        <span className="item-title">{resume.title}</span>
                                        <span className={`item-status ${resume.statusClass}`}>{resume.status}</span>
                                    </div>
                                    <div className="item-meta">{resume.meta}</div>
                                    <div className="vacancy-description">{resume.desc}</div>
                                    <div className="item-actions">
                                        {resume.actions.map((action, idx) => (
                                            <button 
                                                key={idx} 
                                                className="item-action-btn" 
                                                onClick={() => handleAction(action)}
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Контент: Отклики на вакансии */}
            {activeTab === 'responses' && (
                <div className="tab-content active">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Мои отклики на вакансии</h2>
                        </div>
                        
                        <div className="items-list">
                            {RESPONSES.map(resp => (
                                <div key={resp.id} className="item-card">
                                    <div className="item-header">
                                        <span className="item-title">{resp.title}</span>
                                        <span className={`item-status ${resp.statusClass}`}>{resp.status}</span>
                                    </div>
                                    <div className="item-company">{resp.company}</div>
                                    <div className="item-meta">{resp.meta}</div>
                                    {resp.desc && <div className="vacancy-description">{resp.desc}</div>}
                                    <div className="item-actions">
                                        {resp.actions.map((action, idx) => (
                                            <button 
                                                key={idx} 
                                                className="item-action-btn" 
                                                onClick={() => handleAction(action)}
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                            {INVITES.map(invite => (
                                <div key={invite.id} className="item-card">
                                    <div className="item-header">
                                        <span className="item-title">{invite.title}</span>
                                        <span className={`item-status ${invite.statusClass}`}>{invite.status}</span>
                                    </div>
                                    <div className="item-company">{invite.company}</div>
                                    <div className="item-meta">{invite.meta}</div>
                                    <div className="vacancy-description">{invite.desc}</div>
                                    <div className="item-actions">
                                        {invite.actions.map((action, idx) => (
                                            <button 
                                                key={idx} 
                                                className="item-action-btn" 
                                                onClick={() => handleAction(action)}
                                            >
                                                {action}
                                            </button>
                                        ))}
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
                                        defaultValue={USER_DATA.firstName} 
                                        placeholder="Введите имя" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Фамилия</label>
                                    <input 
                                        type="text" 
                                        defaultValue={USER_DATA.lastName} 
                                        placeholder="Введите фамилию" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        defaultValue={USER_DATA.email} 
                                        placeholder="Введите email" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input 
                                        type="tel" 
                                        defaultValue={USER_DATA.phone} 
                                        placeholder="Введите телефон" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Дата рождения</label>
                                    <input 
                                        type="date" 
                                        defaultValue={USER_DATA.birthDate} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Город</label>
                                    <select defaultValue={USER_DATA.city}>
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
                                        defaultValue={USER_DATA.about}
                                        placeholder="Расскажите о себе"
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
                                    <select defaultValue="1">
                                        {PROFESSIONS.map(prof => (
                                            <option key={prof.value} value={prof.value}>
                                                {prof.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Опыт работы (лет)</label>
                                    <input 
                                        type="number" 
                                        defaultValue={USER_DATA.experience} 
                                        min="0" 
                                        max="50" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ожидаемая зарплата</label>
                                    <input 
                                        type="number" 
                                        defaultValue={USER_DATA.salary} 
                                        placeholder="Введите сумму" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Образование</label>
                                    <input 
                                        type="text" 
                                        defaultValue={USER_DATA.education} 
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
                <div 
                    className={`message ${message.type}`} 
                    style={{ 
                        display: 'block', 
                        position: 'fixed', 
                        top: '20px', 
                        right: '20px', 
                        zIndex: 1000 
                    }}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default JobsAccount;