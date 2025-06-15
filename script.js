document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');
    const deleteHighScoreButton = document.getElementById('delete-high-score-button');
    const boardSize = 400;
    const squareSize = 20;
    let snake = [{ x: 200, y: 200 }];
    let direction = { x: 0, y: 0 };
    let food = { x: 0, y: 0 };
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let speed = 200;
    let level = 1;
    let isPaused = false;

    highScoreElement.textContent = highScore;

    function createBoard() {
        board.innerHTML = '';
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.left = `${segment.x}px`;
            snakeElement.style.top = `${segment.y}px`;
            snakeElement.classList.add('snake');
            if (index === 0) {
                snakeElement.classList.add('snake-head');
            }
            board.appendChild(snakeElement);
        });

        const foodElement = document.createElement('div');
        foodElement.style.left = `${food.x}px`;
        foodElement.style.top = `${food.y}px`;
        foodElement.classList.add('food');
        board.appendChild(foodElement);
    }

    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            placeFood();
            updateLevel();
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize || snakeCollision(head)) {
            clearInterval(gameInterval);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreElement.textContent = highScore;
            }
            alert('Game Over');
            resetGame();
        }
    }

    function snakeCollision(head) {
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
        food.y = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
   
        while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            food.x = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
            food.y = Math.floor(Math.random() * (boardSize / squareSize)) * squareSize;
        }
    }

    function changeDirection(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y === 0) direction = { x: 0, y: -squareSize };
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = { x: 0, y: squareSize };
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = { x: -squareSize, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = { x: squareSize, y: 0 };
                break;
        }
    }

    function updateLevel() {
        if (score % 10 === 0) {
            level++;
            levelElement.textContent = level;
            speed -= 20;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    }

    function resetGame() {
        snake = [{ x: 200, y: 200 }];
        direction = { x: 0, y: 0 };
        score = 0;
        level = 1;
        speed = 200;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        placeFood();
        clearInterval(gameInterval);
    }

    function startGame() {
        if (!gameInterval) {
            gameInterval = setInterval(gameLoop, speed);
        }
    }

    function pauseGame() {
        if (isPaused) {
            gameInterval = setInterval(gameLoop, speed);
            pauseButton.textContent = 'Pausar';
        } else {
            clearInterval(gameInterval);
            pauseButton.textContent = 'Continuar';
        }
        isPaused = !isPaused;
    }

    function deleteHighScore() {
        localStorage.removeItem('highScore');
        highScore = 0;
        highScoreElement.textContent = highScore;
    }

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resetButton.addEventListener('click', resetGame);
    deleteHighScoreButton.addEventListener('click', deleteHighScore);
    document.addEventListener('keydown', changeDirection);

    function gameLoop() {
        moveSnake();
        createBoard();
    }

    placeFood();
});