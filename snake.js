// Получение элементов
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');

// Константы игры
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100; // миллисекунды

// Состояние игры
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let score = 0;
let gameLoop = null;
let isPaused = false;

// Инициализация игры
function init() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 1, y: 0 };
    score = 0;
    isPaused = false;
    updateScore();
    spawnFood();
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    gameLoop = setInterval(update, GAME_SPEED);
}

// Обновление счёта
function updateScore() {
    scoreElement.textContent = score;
}

// Генерация еды
function spawnFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    
    // Проверка, что еда не появилась на змее
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            spawnFood();
            break;
        }
    }
}

// Основной игровой цикл
function update() {
    if (isPaused) return;
    
    // Движение змеи
    const head = { 
        x: snake[0].x + velocity.x, 
        y: snake[0].y + velocity.y 
    };
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с собой
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Добавление новой головы
    snake.unshift(head);
    
    // Проверка поедания еды
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        spawnFood();
    } else {
        snake.pop();
    }
    
    draw();
}

// Отрисовка
function draw() {
    // Очистка canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисование сетки (опционально)
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Рисование еды
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Рисование змеи
    snake.forEach((segment, index) => {
        // Градиент для змеи от головы к хвосту
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            segment.x * GRID_SIZE + GRID_SIZE,
            segment.y * GRID_SIZE + GRID_SIZE
        );
        
        if (index === 0) {
            // Голова
            gradient.addColorStop(0, '#51cf66');
            gradient.addColorStop(1, '#37b24d');
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#51cf66';
        } else {
            // Тело
            const opacity = 1 - (index / snake.length) * 0.5;
            gradient.addColorStop(0, `rgba(81, 207, 102, ${opacity})`);
            gradient.addColorStop(1, `rgba(55, 178, 77, ${opacity})`);
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#51cf66';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
    ctx.shadowBlur = 0;
}

// Конец игры
function gameOver() {
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

// Перезапуск игры
function restartGame() {
    gameOverElement.classList.remove('show');
    init();
}

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    // Предотвращение прокрутки страницы стрелками
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // Пауза
    if (e.key === ' ') {
        isPaused = !isPaused;
        return;
    }
    
    // Управление (нельзя развернуться на 180 градусов)
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && velocity.y === 0) {
        velocity = { x: 0, y: -1 };
    } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && velocity.y === 0) {
        velocity = { x: 0, y: 1 };
    } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && velocity.x === 0) {
        velocity = { x: -1, y: 0 };
    } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && velocity.x === 0) {
        velocity = { x: 1, y: 0 };
    }
});

// Запуск игры
init();
