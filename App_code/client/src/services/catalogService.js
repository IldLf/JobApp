const API_URL = 'http://localhost:5000/api';

class CatalogService {
    async getProfessions() {
        try {
            const response = await fetch(`${API_URL}/professions`);
            const data = await response.json();
            return data.success ? data.professions : [];
        } catch (error) {
            console.error('Ошибка получения профессий:', error);
            return [];
        }
    }

    async getVacancyCities() {
        try {
            const response = await fetch(`${API_URL}/vacancy-cities`);
            const data = await response.json();
            return data.success ? data.cities : [];
        } catch (error) {
            console.error('Ошибка получения городов для вакансий:', error);
            return [];
        }
    }

    async getVacancies(filters = {}, page = 1, limit = 5) {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);

            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (value && value !== 'all' && value !== '' && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const url = `${API_URL}/vacancies${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.success ? data : { vacancies: [], total: 0, page: 1, totalPages: 0 };
        } catch (error) {
            console.error('Ошибка получения вакансий:', error);
            return { vacancies: [], total: 0, page: 1, totalPages: 0 };
        }
    }

    async getResumes(filters = {}, page = 1, limit = 5) {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);

            // Убираем city из параметров для резюме
            const { city, ...resumeFilters } = filters;

            Object.keys(resumeFilters).forEach(key => {
                const value = resumeFilters[key];
                if (value && value !== 'all' && value !== '' && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const url = `${API_URL}/resumes${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.success ? data : { resumes: [], total: 0, page: 1, totalPages: 0 };
        } catch (error) {
            console.error('Ошибка получения резюме:', error);
            return { resumes: [], total: 0, page: 1, totalPages: 0 };
        }
    }

    async respondToVacancy(vacancyId, userId, coverLetter) {
        try {
            const response = await fetch(`${API_URL}/vacancy-responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vacancy_id: vacancyId,
                    user_id: userId,
                    cover_letter: coverLetter
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка отклика на вакансию:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async respondToResume(resumeId, userId, message) {
        try {
            const response = await fetch(`${API_URL}/resume-responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume_id: resumeId,
                    user_id: userId,
                    message: message
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Ошибка приглашения на резюме:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }
}

export default new CatalogService();