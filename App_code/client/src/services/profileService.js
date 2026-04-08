const API_URL = 'http://localhost:5000/api';

class ProfileService {
    async getApplicantData(userId) {
        try {
            const response = await fetch(`${API_URL}/applicant/profile/${userId}`);
            const data = await response.json();
            return data; 
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            return { success: false, error: error.message };
        }
    }

    async getResponsesData(userId) {
        try {
            const response = await fetch(`${API_URL}/applicant/responses/${userId}`);
            const data = await response.json();
            return data; 
        } catch (error) {
            console.error('Ошибка получения откликов:', error);
            return { success: false, error: error.message };
        }
    }
    async getApplicantResumes(userId) {
        try {
            const response = await fetch(`${API_URL}/applicant/resumes/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения резюме:', error);
            return { success: false, error: error.message, resumes: [] };
        }
    }
    async getApplicantResumeResponses(userId) {
        try {
            const response = await fetch(`${API_URL}/applicant/resume_responses/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения приглашений:', error);
            return { success: false, error: error.message, resumes: [] };
        }
    }

    async updateApplicantProfile(userId, profileData) {
        try {
            const response = await fetch(`${API_URL}/applicant/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return { success: false, error: error.message };
        }
    }

    async updatePassword(userId, passwordData) {
        try {
            const response = await fetch(`${API_URL}/user/password/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления пароля:', error);
            return { success: false, error: error.message };
        }
    }


    async getEmployerData(userId) {
        try {
            const response = await fetch(`${API_URL}/employer/profile/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения профиля работодателя:', error);
            return { success: false, error: error.message };
        }
    }

    async updateEmployerProfile(userId, profileData) {
        try {
            const response = await fetch(`${API_URL}/employer/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления профиля работодателя:', error);
            return { success: false, error: error.message };
        }
    }

    async getEmployerVacancies(userId) {
        try {
            const response = await fetch(`${API_URL}/employer/vacancies/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения вакансий:', error);
            return { success: false, error: error.message, vacancies: [] };
        }
    }

    async getEmployerResponses(userId) {
        try {
            const response = await fetch(`${API_URL}/employer/responses/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения откликов:', error);
            return { success: false, error: error.message, responses: [] };
        }
    }

    async getEmployerResumeResponses(userId) {
        try {
            const response = await fetch(`${API_URL}/employer/resume-responses/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения приглашений:', error);
            return { success: false, error: error.message, resume_responses: [] };
        }
    }

    // Получить список профессий
    async getProfessions() {
        try {
            const response = await fetch(`${API_URL}/professions`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения профессий:', error);
            return { success: false, error: error.message, professions: [] };
        }
    }

    // Получить applicant по user_id
    async getApplicantByUserId(userId) {
        try {
            const response = await fetch(`${API_URL}/applicants/by-user/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка получения профиля соискателя:', error);
            return { success: false, error: error.message };
        }
    }

    // Создать резюме
    async createResume(resumeData) {
        try {
            const response = await fetch(`${API_URL}/resumes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка создания резюме:', error);
            return { success: false, error: error.message };
        }
    }

    // Обновить резюме
    async updateResume(resumeId, resumeData) {
        try {
            const response = await fetch(`${API_URL}/resumes/${resumeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления резюме:', error);
            return { success: false, error: error.message };
        }
    }    

    // Обновить статус резюме (активно/неактивно)
    async toggleResumeStatus(resumeId, isActive) {
        try {
            const response = await fetch(`${API_URL}/resumes/${resumeId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: isActive })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления статуса резюме:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new ProfileService();