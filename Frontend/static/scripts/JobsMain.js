function showVacancies() {
    // Переключение активной вкладки
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Показать вакансии, скрыть резюме
    document.getElementById('vacancies-list').style.display = 'flex';
    document.getElementById('resumes-list').style.display = 'none';
}

function showResumes() {
    // Переключение активной вкладки
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Показать резюме, скрыть вакансии
    document.getElementById('vacancies-list').style.display = 'none';
    document.getElementById('resumes-list').style.display = 'flex';
}

// Добавим простую валидацию для фильтров (заглушка)
document.querySelector('.apply-filters-btn').addEventListener('click', function() {
    const messageDiv = document.getElementById('info-message');
    messageDiv.className = 'message info';
    messageDiv.textContent = 'Фильтры применены (демо-режим)';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
});

// Обработчик для карточек (заглушка)
document.querySelectorAll('.vacancy-card, .resume-card').forEach(card => {
    card.addEventListener('click', function() {
        const messageDiv = document.getElementById('info-message');
        messageDiv.className = 'message info';
        messageDiv.textContent = 'Для просмотра детальной информации войдите в личный кабинет';
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    });
});

// Функция для показа сообщения при отклике
function showResponseMessage() {
    const messageDiv = document.getElementById('info-message');
    messageDiv.className = 'message info';
    messageDiv.textContent = 'Отклик отправлен (демо-режим)';
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}