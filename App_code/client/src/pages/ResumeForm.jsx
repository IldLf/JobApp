import React, {useState, useEffect} from 'react';
import '../styles/ResumeForm.css';

const ResumeForm = ({
                        isOpen,
                        onClose,
                        onResumeSaved,
                        resumeToEdit = null,
                        professions = []
                    }) => {
    const [formData, setFormData] = useState({
        title: '',
        salary: '',
        experience: '',
        about: '',
        profession_id: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Заполняем форму данными при редактировании
    useEffect(() => {
        if (resumeToEdit) {
            setFormData({
                title: resumeToEdit.title || '',
                salary: resumeToEdit.salary || '',
                experience: resumeToEdit.experience || '',
                about: resumeToEdit.about || '',
                profession_id: resumeToEdit.profession_id || ''
            });
        } else {
            // Сбрасываем форму при создании нового
            setFormData({
                title: '',
                salary: '',
                experience: '',
                about: '',
                profession_id: ''
            });
        }
        setErrors({});
    }, [resumeToEdit, isOpen]);

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

    // Валидация
    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Укажите желаемую должность';
        }

        if (!formData.profession_id) {
            newErrors.profession_id = 'Выберите профессию';
        }

        if (formData.salary && (isNaN(formData.salary) || formData.salary < 0)) {
            newErrors.salary = 'Зарплата должна быть положительным числом';
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

            const applicantResponse = await fetch(`http://localhost:5000/api/applicants/by-user/${user.id}`);
            const applicantData = await applicantResponse.json();

            if (!applicantData.success || !applicantData.applicant) {
                alert('Ошибка: профиль соискателя не найден');
                setIsSubmitting(false);
                return;
            }

            const applicantId = applicantData.applicant.id;

            // Формируем данные для отправки
            const resumeData = {
                applicant_id: applicantId,
                title: formData.title.trim(),
                salary: formData.salary ? parseInt(formData.salary) : null,
                experience: formData.experience.trim(),
                about: formData.about.trim(),
                profession_id: formData.profession_id ? parseInt(formData.profession_id) : null
            };

            // Только для создания нового резюме добавляем is_active = 2 (на модерацию)
            if (!resumeToEdit) {
                resumeData.is_active = 2;
            }

            const url = resumeToEdit
                ? `http://localhost:5000/api/resumes/${resumeToEdit.id}`
                : 'http://localhost:5000/api/resumes';

            const method = resumeToEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resumeData)
            });

            const result = await response.json();

            if (result.success) {
                onResumeSaved(result.resume || result.updatedResume);
                onClose();
            } else {
                alert(`Ошибка: ${result.error || 'Не удалось сохранить резюме'}`);
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            alert('Ошибка соединения с сервером');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="resume-modal-overlay" onClick={onClose}>
            <div className="resume-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="resume-modal-header">
                    <h2>{resumeToEdit ? 'Редактировать резюме' : 'Создать резюме'}</h2>
                    <button className="resume-modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="resume-form">
                    {/* Желаемая должность */}
                    <div className="form-group">
                        <label className="form-label">
                            Желаемая должность <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Например: Senior Python разработчик"
                            className={`form-input ${errors.title ? 'error' : ''}`}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    {/* Профессия */}
                    <div className="form-group">
                        <label className="form-label">
                            Профессия <span className="required">*</span>
                        </label>
                        <select
                            name="profession_id"
                            value={formData.profession_id}
                            onChange={handleChange}
                            className={`form-select ${errors.profession_id ? 'error' : ''}`}
                        >
                            <option value="">Выберите профессию</option>
                            {professions.map(prof => (
                                <option key={prof.id} value={prof.id}>
                                    {prof.name}
                                </option>
                            ))}
                        </select>
                        {errors.profession_id && <span className="error-message">{errors.profession_id}</span>}
                    </div>

                    {/* Зарплата */}
                    <div className="form-group">
                        <label className="form-label">
                            Желаемая зарплата (₽)
                        </label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="Например: 180000"
                            min="0"
                            className={`form-input ${errors.salary ? 'error' : ''}`}
                        />
                        {errors.salary && <span className="error-message">{errors.salary}</span>}
                    </div>

                    {/* Опыт работы */}
                    <div className="form-group">
                        <label className="form-label">Опыт работы</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Например: 5 лет разработки на Python, Django, FastAPI"
                            rows="3"
                            className="form-textarea"
                        />
                    </div>

                    {/* О себе */}
                    <div className="form-group">
                        <label className="form-label">О себе</label>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Расскажите о своих навыках, достижениях и опыте..."
                            rows="5"
                            className="form-textarea"
                        />
                    </div>

                    {/* Кнопки */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : (resumeToEdit ? 'Сохранить изменения' : 'Создать резюме')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResumeForm;