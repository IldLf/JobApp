const API_URL = 'http://localhost:5000/api';

class AuthService {
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isAuthenticated', 'true');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка входа:', error);
            return {
                success: false,
                error: 'Ошибка подключения к серверу'
            };
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isAuthenticated', 'true');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return {
                success: false,
                error: 'Ошибка подключения к серверу'
            };
        }
    }
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    }
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }
    isAuthenticated() {
        return !!localStorage.getItem('user');
    }
}

export default new AuthService();