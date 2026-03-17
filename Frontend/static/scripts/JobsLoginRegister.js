function showForm(formType) {
    // Обновление активной вкладки
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Переключение формы
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.remove('active');
    
    if (formType === 'login') {
        document.getElementById('login-form').classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
    }

    // Скрыть сообщения при переключении
    document.getElementById('login-message').style.display = 'none';
    document.getElementById('register-message').style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');

    // Простая валидация
    if (!email || !password) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Пожалуйста, заполните все поля';
        return false;
    }

    // Демонстрационное сообщение
    messageDiv.className = 'message success';
    messageDiv.textContent = 'Вход выполнен успешно! (демо-режим)';
    return false;
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const messageDiv = document.getElementById('register-message');

    // Проверка заполнения всех полей
    if (!name || !email || !password || !confirmPassword) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Пожалуйста, заполните все поля';
        return false;
    }

    // Проверка длины пароля
    if (password.length < 8) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Пароль должен содержать минимум 8 символов';
        return false;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Пароли не совпадают';
        return false;
    }

    // Проверка email
    if (!email.includes('@') || !email.includes('.')) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Введите корректный email';
        return false;
    }

    // Демонстрационное сообщение
    messageDiv.className = 'message success';
    messageDiv.textContent = 'Регистрация успешна! (демо-режим)';
    return false;
}