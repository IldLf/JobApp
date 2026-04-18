import React, {useState, useEffect} from 'react';
import '../styles/VacancyForm.css';

const VacancyForm = ({
                         isOpen,
                         onClose,
                         onVacancySaved,
                         vacancyToEdit = null,
                         professions = []
                     }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        salary_from: '',
        salary_to: '',
        city: '',
        employment_type: '',
        experience_required: '',
        profession_id: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Данные для подсказок
    const cities = [
        'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
        'Казань', 'Нижний Новгород', 'Челябинск', 'Самара'
    ];

    const employmentTypes = [
        {value: 'full-time', label: 'Полная занятость'},
        {value: 'part-time', label: 'Частичная занятость'},
        {value: 'project', label: 'Проектная работа'},
        {value: 'train', label: 'Стажировка'}
    ];

    // Заполняем форму при редактировании
    useEffect(() => {
        if (vacancyToEdit) {
            setFormData({
                title: vacancyToEdit.title || '',
                description: vacancyToEdit.description || '',
                salary_from: vacancyToEdit.salary_from || '',
                salary_to: vacancyToEdit.salary_to || '',
                city: vacancyToEdit.city || '',
                employment_type: vacancyToEdit.employment_type || '',
                experience_required: vacancyToEdit.experience_required || '',
                profession_id: vacancyToEdit.profession_id || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                salary_from: '',
                salary_to: '',
                city: '',
                employment_type: '',
                experience_required: '',
                profession_id: ''
            });
        }
        setErrors({});
    }, [vacancyToEdit, isOpen]);

    // Обработка изменения полей
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку при изменении
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Валидация опыта работы
    const validateExperience = (value) => {
        // Пустое значение или только пробелы — допустимо
        if (!value || value.trim() === '') {
            return true;
        }

        // "Без опыта" — допустимо
        if (value.trim() === 'Без опыта') {
            return true;
        }

        // Формат: "цифра-цифра года" или "цифра-цифра лет"
        // Например: "1-3 года", "3-6 лет", "10-15 лет"
        const experienceRegex = /^\d+\s*-\s*\d+\s+(года|лет|год)$/i;
        return experienceRegex.test(value.trim());
    };

    // Валидация
    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Укажите название должности';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Опишите обязанности и требования';
        }

        if (!formData.profession_id) {
            newErrors.profession_id = 'Выберите профессию';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'Укажите город';
        }

        if (!formData.employment_type) {
            newErrors.employment_type = 'Выберите тип занятости';
        }

        // Валидация опыта работы
        if (!validateExperience(formData.experience_required)) {
            newErrors.experience_required = 'Формат: "1-3 года", "3-6 лет" или "Без опыта"';
        }

        // Проверка зарплат (только логика: от <= до)
        if (formData.salary_from && formData.salary_to) {
            const from = Number(formData.salary_from);
            const to = Number(formData.salary_to);
            if (!isNaN(from) && !isNaN(to) && from > to) {
                newErrors.salary_to = 'Максимальная зарплата должна быть больше минимальной';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            const companyResponse = await fetch(`http://localhost:5000/api/employer/profile/${user.id}`);
            const companyData = await companyResponse.json();

            if (!companyData.success || !companyData.profile.company) {
                alert('Ошибка: профиль компании не найден');
                setIsSubmitting(false);
                return;
            }

            const companyId = companyData.profile.company.id;

            // Формируем данные для отправки
            const vacancyData = {
                company_id: companyId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                salary_from: formData.salary_from !== '' ? Number(formData.salary_from) : null,
                salary_to: formData.salary_to !== '' ? Number(formData.salary_to) : null,
                city: formData.city.trim(),
                employment_type: formData.employment_type,
                experience_required: formData.experience_required.trim() || null,
                profession_id: formData.profession_id ? parseInt(formData.profession_id) : null
            };

            // Только для создания новой вакансии добавляем is_active = 2 (на модерацию)
            if (!vacancyToEdit) {
                vacancyData.is_active = 2;
            }

            const url = vacancyToEdit
                ? `http://localhost:5000/api/vacancies/${vacancyToEdit.id}`
                : 'http://localhost:5000/api/vacancies';

            const method = vacancyToEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vacancyData)
            });

            const result = await response.json();

            if (result.success) {
                onVacancySaved(result.vacancy || result.updatedVacancy);
                onClose();
            } else {
                alert(`Ошибка: ${result.error || 'Не удалось сохранить вакансию'}`);
            }
        } catch (error) {
            console.error('Error saving vacancy:', error);
            alert('Ошибка соединения с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="vac-modal-content vacancy-form" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{vacancyToEdit ? 'Редактировать вакансию' : 'Создать вакансию'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Название должности */}
                    <div className="form-group">
                        <label>
                            Должность <span className="required">*</span>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Например: Senior Python Developer"
                                className={errors.title ? 'error' : ''}
                            />
                        </label>
                        {errors.title && <span className="error-message">{errors.title}</span>}
                        <span className="hint">Укажите название предлагаемой должности</span>
                    </div>

                    {/* Профессия */}
                    <div className="form-group">
                        <label>
                            Категория профессии <span className="required">*</span>
                            <select
                                name="profession_id"
                                value={formData.profession_id}
                                onChange={handleChange}
                                className={errors.profession_id ? 'error' : ''}
                            >
                                <option value="">Выберите профессию</option>
                                {professions.map(prof => (
                                    <option key={prof.id} value={prof.id}>
                                        {prof.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.profession_id && <span className="error-message">{errors.profession_id}</span>}
                        <span className="hint">Выберите подходящую категорию</span>
                    </div>

                    {/* Город */}
                    <div className="form-group">
                        <label>
                            Город <span className="required">*</span>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Например: Москва"
                                list="cities-list"
                                className={errors.city ? 'error' : ''}
                            />
                            <datalist id="cities-list">
                                {cities.map(city => (
                                    <option key={city} value={city}/>
                                ))}
                            </datalist>
                        </label>
                        {errors.city && <span className="error-message">{errors.city}</span>}
                        <span className="hint">Укажите город работы</span>
                    </div>

                    {/* Тип занятости */}
                    <div className="form-group">
                        <label>
                            Тип занятости <span className="required">*</span>
                            <select
                                name="employment_type"
                                value={formData.employment_type}
                                onChange={handleChange}
                                className={errors.employment_type ? 'error' : ''}
                            >
                                <option value="">Выберите тип занятости</option>
                                {employmentTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.employment_type && <span className="error-message">{errors.employment_type}</span>}
                        <span className="hint">Выберите формат работы</span>
                    </div>

                    {/* Опыт работы — СВОБОДНЫЙ ВВОД */}
                    <div className="form-group">
                        <label>
                            Опыт работы
                            <input
                                type="text"
                                name="experience_required"
                                value={formData.experience_required}
                                onChange={handleChange}
                                placeholder="Например: 1-3 года, 3-6 лет, Без опыта"
                                className={errors.experience_required ? 'error' : ''}
                            />
                        </label>
                        {errors.experience_required && (
                            <span className="error-message">{errors.experience_required}</span>
                        )}
                        <span className="hint">
              Формат: "1-3 года", "3-6 лет" или "Без опыта". Оставьте пустым, если не важно
            </span>
                    </div>

                    {/* Зарплата */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                Зарплата от (₽)
                                <input
                                    type="number"
                                    name="salary_from"
                                    value={formData.salary_from}
                                    onChange={handleChange}
                                    placeholder="0"
                                    // Убрали min="0" — теперь можно вводить любые числа
                                />
                            </label>
                            <span className="hint">Минимальная ставка</span>
                        </div>

                        <div className="form-group">
                            <label>
                                Зарплата до (₽)
                                <input
                                    type="number"
                                    name="salary_to"
                                    value={formData.salary_to}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={errors.salary_to ? 'error' : ''}
                                />
                            </label>
                            {errors.salary_to && <span className="error-message">{errors.salary_to}</span>}
                            <span className="hint">Максимальная ставка</span>
                        </div>
                    </div>

                    {/* Описание */}
                    <div className="form-group">
                        <label>
                            Описание вакансии <span className="required">*</span>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Опишите:&#10;• Обязанности&#10;• Требования к кандидату&#10;• Условия работы&#10;• Что мы предлагаем"
                                className={errors.description ? 'error' : ''}
                            />
                        </label>
                        {errors.description && <span className="error-message">{errors.description}</span>}
                        <span className="hint">Чем подробнее описание, тем больше подходящих откликов</span>
                    </div>

                    {/* Кнопки */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : (vacancyToEdit ? 'Сохранить изменения' : 'Создать вакансию')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VacancyForm;