const API_URL = 'http://localhost:5000/api';

class ProfileService {
    // Получить полный профиль соискателя
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

    async getDashboardStats(userId) {
        try {
            const response = await fetch(`${API_URL}/dashboard/stats/${userId}`);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new ProfileService();