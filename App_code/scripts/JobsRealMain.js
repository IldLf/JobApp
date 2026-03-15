// Демо-режим для кнопок
document.addEventListener('DOMContentLoaded', function() {
    // Все кнопки, кроме навигационных ссылок
    document.querySelectorAll('button:not(.nav-link), .btn:not(.nav-link)').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('Демо-режим: это тестовая версия сайта');
        });
    });

    // Популярные теги
    document.querySelectorAll('.popular-search-tag, .category-card').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim();
            showMessage(`Поиск по категории "${text}" (демо-режим)`);
        });
    });

    // Кнопки отклика на вакансии
    document.querySelectorAll('.response-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showMessage('Отклик отправлен! (демо-режим)');
        });
    });

    // Карточки вакансий
    document.querySelectorAll('.vacancy-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.vacancy-title').textContent;
            showMessage(`Просмотр вакансии "${title}" (демо-режим)`);
        });
    });
});

// Функция показа сообщения
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message ' + type;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}