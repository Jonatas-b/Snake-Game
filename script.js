document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const resetButton = document.getElementById('reset-button');
    const deleteHighScoreButton = document.getElementById('delete-high-score-button');
    const boardSize = 400;
    const squareSize = 20;
    let snake = [{ x: 10, y: 10 }]; // células
    let food = { x: 5, y: 5 };      // células
    let direction = { x: 0, y: 0 };
    let nextDirection = { x: 0, y: 0 };
    let gameInterval;
    let score = 0;
    let highScore = Number(localStorage.getItem('highScore')) || 0;
    let speed = 200;
    let level = 1;
    let isPaused = false;

    highScoreElement.textContent = highScore;

    const cells = boardSize / squareSize; // 20

    function createBoard() {
        board.innerHTML = '';
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.left = `${segment.x * squareSize}px`;
            snakeElement.style.top = `${segment.y * squareSize}px`;
            snakeElement.classList.add('snake');
            if (index === 0) {
                snakeElement.classList.add('snake-head');
            }
            board.appendChild(snakeElement);
        });

        const foodElement = document.createElement('div');
        foodElement.style.left = `${food.x * squareSize}px`;
        foodElement.style.top = `${food.y * squareSize}px`;
        foodElement.classList.add('food');
        board.appendChild(foodElement);
    }

    // Exemplo de função moveSnake correta
    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (
            head.x < 0 ||
            head.x >= cells ||
            head.y < 0 ||
            head.y >= cells ||
            snakeCollision(head)
        ) {
            clearInterval(gameInterval);
            showGameOverModal();
            resetGame();
            return false;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            eatSound.currentTime = 0;
            eatSound.play();
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

        if (snake.length === cells * cells) {
            clearInterval(gameInterval);
            showVictoryModal();
            resetGame();
            return false;
        }

        return true;
    }

    function snakeCollision(head) {
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * cells);
        food.y = Math.floor(Math.random() * cells);
        while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            food.x = Math.floor(Math.random() * cells);
            food.y = Math.floor(Math.random() * cells);
        }
    }

    function changeDirection(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y === 0) nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (direction.y === 0) nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (direction.x === 0) nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === 0) nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    // Suporte a swipe para mobile (em células)
    document.addEventListener('touchend', function(e) {
        if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                // Swipe horizontal
                if (dx > 20 && nextDirection.x !== -1) nextDirection = { x: 1, y: 0 }; // Direita
                else if (dx < -20 && nextDirection.x !== 1) nextDirection = { x: -1, y: 0 }; // Esquerda
            } else {
                // Swipe vertical
                if (dy > 20 && nextDirection.y !== -1) nextDirection = { x: 0, y: 1 }; // Baixo
                else if (dy < -20 && nextDirection.y !== 1) nextDirection = { x: 0, y: -1 }; // Cima
            }
        }
    });

    const gameBoard = document.getElementById('game-board');

    gameBoard.addEventListener('touchstart', function(e) {
        e.preventDefault();
        // ... seu código de início de swipe (se houver) ...
    }, { passive: false });

    gameBoard.addEventListener('touchend', function(e) {
        e.preventDefault();
        // ... seu código de swipe ...
    }, { passive: false });

    function updateLevel() {
        if (score % 10 === 0) {
            level++;
            levelElement.textContent = level;
            speed -= 20;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
            levelUpSound.currentTime = 0;
            levelUpSound.play();
        }
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        direction = { x: 0, y: 0 };
        nextDirection = { x: 0, y: 0 }; // <-- Adicione esta linha
        score = 0;
        level = 1;
        speed = 200;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        placeFood();
        createBoard();
    }

    function startGame() {
        // Reseta variáveis e inicia o loop do jogo
        resetGame();
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed);
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

    function showVictoryModal() {
        winSound.currentTime = 0;
        winSound.play();
        document.getElementById('final-score').textContent = score;
        document.getElementById('final-high-score').textContent = highScore;
        const modal = document.getElementById('game-over-modal');
        const content = modal.querySelector('.game-over-content');
        content.classList.add('victory');
        modal.style.display = 'flex';
        content.querySelector('h2').textContent = 'Você Venceu!';
    }
    function showGameOverModal() {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        const modal = document.getElementById('game-over-modal');
        const content = modal.querySelector('.game-over-content');
        content.classList.remove('victory');
        content.querySelector('h2').textContent = 'Game Over';
        document.getElementById('final-score').textContent = score;
        document.getElementById('final-high-score').textContent = highScore;
        modal.style.display = 'flex';
    }

    const restartButton = document.getElementById('restart-button');

    function hideGameOverModal() {
        document.getElementById('game-over-modal').style.display = 'none';
    }

    restartButton.addEventListener('click', function() {
        hideGameOverModal();
        startGame();
    });

    resetButton.addEventListener('click', startGame); // Pode usar startGame para ambos
    deleteHighScoreButton.addEventListener('click', deleteHighScore);
    document.addEventListener('keydown', function(event) {
        // Impede o scroll da página ao usar as setas
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            changeDirection(event);
        }
    });

    // Suporte a swipe para mobile
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });

    function gameLoop() {
        direction = nextDirection;
        if (moveSnake()) {
            createBoard();
        }
    }

    placeFood();
    startGame(); // Faz o jogo começar automaticamente ao carregar a página

    const eatSound = new Audio('sons/eat.mp3');
    const gameOverSound = new Audio('sons/gameover.mp3');
    const winSound = new Audio('sons/win.mp3');
    const levelUpSound = new Audio('sons/levelup.mp3');
});
