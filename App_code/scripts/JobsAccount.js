function showTab(tabName) {
    // Скрыть все табы
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Скрыть весь контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Активировать выбранный таб
    event.target.classList.add('active');
    
    // Показать соответствующий контент
    document.getElementById(tabName + '-content').classList.add('active');
}

function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message ' + type;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    
    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Заглушки для всех кнопок
document.querySelectorAll('button:not(.tab)').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const text = this.textContent || 'действие';
        showMessage(`Функция "${text}" (демо-режим)`);
    });
});