const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 200;
canvas.height = 400;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const BORDER_SIZE = 6;

const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const COLORS = ["red", "blue", "yellow", "green"];

const PIECES = [
    [[1, 1, 1], [0, 1, 0]],  // T
    [[1, 1, 1, 1]],          // I
    [[1, 1], [1, 1]],        // O
    [[1, 1, 0], [0, 1, 1]],  // Z
    [[0, 1, 1], [1, 1, 0]],  // S
    [[1, 1, 1], [1, 0, 0]],  // L
    [[1, 1, 1], [0, 0, 1]]   // J
];

let piece = randomPiece();
let pieceColor = randomColor();
let x = 3, y = 0;
let score = 0;
let linesCleared = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

let speed = 500;
const minSpeed = 100;
const speedDecreasePerLine = 2;
const maxLinesForSpeed = 200;

let gameRunning = true;

document.addEventListener("keydown", (event) => {
    if (!gameRunning) return;
    if (event.key === "ArrowLeft") moveLeft();
    if (event.key === "ArrowRight") moveRight();
    if (event.key === "ArrowUp") rotatePiece();
    if (event.key === "ArrowDown") dropPiece();
});

function moveLeft() {
    if (!collision(-1, 0)) x--;
}

function moveRight() {
    if (!collision(1, 0)) x++;
}

function dropPiece() {
    if (!collision(0, 1)) {
        y++;
    } else {
        mergePiece();
        removeLines();
        piece = randomPiece();
        pieceColor = randomColor();
        x = 3;
        y = 0;
        if (collision(0, 0)) endGame();
    }
}

function rotatePiece() {
    const newPiece = piece[0].map((_, i) => piece.map(row => row[i])).reverse();
    if (!collision(0, 0, newPiece)) piece = newPiece;
}

function collision(dx, dy, newPiece = piece) {
    return newPiece.some((row, r) =>
        row.some((cell, c) => 
            cell &&
            (board[y + r + dy]?.[x + c + dx] !== 0 || x + c + dx < 0 || x + c + dx >= COLS || y + r + dy >= ROWS)
        )
    );
}

function mergePiece() {
    piece.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) board[y + r][x + c] = pieceColor;
        });
    });
}

function removeLines() {
    let lines = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            linesCleared++;
        }
    }

    if (lines > 0) {
        score += lines * 10;
        document.getElementById("score").innerText = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            document.getElementById("highScore").innerText = highScore;
        }

        increaseSpeed(lines);
    }
}

function increaseSpeed(lines) {
    if (linesCleared < maxLinesForSpeed) {
        speed = Math.max(minSpeed, speed - lines * speedDecreasePerLine);
        clearInterval(gameInterval);
        gameInterval = setInterval(dropPiece, speed);
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    document.getElementById("final-score").innerText = score;
    document.getElementById("game-over").classList.remove("hidden");
}

// ✅ FUNCIONA BIEN AHORA: REINICIA EL JUEGO SIN ERRORES
function restartGame() {
    location.reload(); // Recarga la página correctamente
}

function randomPiece() {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
}

function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function update() {
    drawBoard();
    if (gameRunning) requestAnimationFrame(update);
}

function drawBoard() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) drawBlock(col, row, board[row][col]);
        }
    }

    piece.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) drawBlock(x + c, y + r, pieceColor);
        });
    });
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.lineWidth = BORDER_SIZE;
    ctx.strokeStyle = "black";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

update();
let gameInterval = setInterval(dropPiece, speed);
