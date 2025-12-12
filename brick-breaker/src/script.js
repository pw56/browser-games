const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');

// canvasのサイズをブラウザ全域に合わせる
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

// ゲーム内のサイズや速度をcanvasに合わせてスケーリング
const paddleWidthScale = 0.15;
const paddleHeightScale = 0.02;
const ballRadiusScale = 0.02;

let paddleWidth = canvas.width * paddleWidthScale;
let paddleHeight = canvas.height * paddleHeightScale;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = canvas.width * 0.01;

let ballRadius = canvas.width * ballRadiusScale;
let ballX = canvas.width / 2;
let ballY = canvas.height - paddleHeight - ballRadius - 10;
let baseBallSpeed = 6;
let ballSpeed = baseBallSpeed * 1.5; // 従来の1.5倍
let ballSpeedX;
let ballSpeedY;

let blockWidth = canvas.width * 0.05;
let blockHeight = canvas.height * 0.025;
let rows = 10;
let cols = 14;
let blockPadding = 10;
let blockOffsetTop = canvas.height / 4;
let blockOffsetLeft = (canvas.width - (cols * blockWidth + (cols - 1) * blockPadding)) / 2;

const blockColors = ['#FF00FF', '#FFFF00', '#00FF00', '#00FFFF', '#FF0000'];

let blocks = [];
let score = 0;
let isGameOver = false;
let isGameClear = false;

let rightArrowPressed = false;
let leftArrowPressed = false;

// スタートボタンが押された時にゲームを開始
function startGame() {
    startButton.style.display = 'none';  // スタートボタンを非表示
    retryButton.style.display = 'none';  // リトライボタンを非表示
    canvas.style.display = 'block';      // キャンバスを表示
    createBlocks();                      // ブロック作成
    initBall();                           // ボール初期化
    gameLoop();                          // ゲームループを開始
}

startButton.addEventListener('click', startGame);

// キーイベント
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        rightArrowPressed = true;
    } else if (e.key === 'ArrowLeft') {
        leftArrowPressed = true;
    } else if (e.key === ' ') {
        if (isGameOver || isGameClear) resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        rightArrowPressed = false;
    } else if (e.key === 'ArrowLeft') {
        leftArrowPressed = false;
    }
});

// ブロック作成
function createBlocks() {
    for (let c = 0; c < cols; c++) {
        blocks[c] = [];
        for (let r = 0; r < rows; r++) {
            blocks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// ボール初期化（ランダム角度で発射 ±70°）
function initBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - paddleHeight - ballRadius - 10;
    let angle = (Math.random() * 140 - 70) * Math.PI / 180; // -70°～70°
    ballSpeedX = ballSpeed * Math.sin(angle);
    ballSpeedY = -ballSpeed * Math.cos(angle);
}

// ボール描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

// パドル描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = 'cyan';
    ctx.fill();
    ctx.closePath();
}

// ブロック描画
function drawBlocks() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (blocks[c][r].status === 1) {
                let blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
                let blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                ctx.beginPath();
                ctx.rect(blockX, blockY, blockWidth, blockHeight);
                ctx.fillStyle = blockColors[Math.floor(r / 2) % blockColors.length];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 衝突判定
function collisionDetection() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let b = blocks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + blockWidth && ballY > b.y && ballY < b.y + blockHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    if (score === rows * cols) {
                        isGameClear = true;
                    }
                }
            }
        }
    }
}

// スコア描画
function drawScore() {
    ctx.font = '32px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('スコア: ' + score, canvas.width / 2 - 100, 40);
}

// ゲームオーバー描画
function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '50px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('ゲームオーバー', canvas.width / 2 - 150, canvas.height / 2 - 50);
    ctx.fillText('スコア: ' + score, canvas.width / 2 - 100, canvas.height / 2);
}

// ゲームクリア描画
function drawGameClear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '50px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('ゲームクリア！', canvas.width / 2 - 150, canvas.height / 2 - 50);
    ctx.fillText('スコア: ' + score, canvas.width / 2 - 100, canvas.height / 2);
}

// ボール位置更新
function updateBallPosition() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            // ボールがパドルに当たったとき摩擦を反映
            let hitPoint = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            ballSpeedX += hitPoint * 2; // パドル中央からの距離でX方向に影響
            ballSpeedY = -Math.abs(ballSpeedY);
        } else {
            isGameOver = true;
        }
    }
}

// パドル位置更新
function updatePaddlePosition() {
    if (rightArrowPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftArrowPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }
}

// ゲームリセット
function resetGame() {
    paddleX = (canvas.width - paddleWidth) / 2;
    initBall();
    score = 0;
    isGameOver = false;
    isGameClear = false;
    createBlocks();
}

// ゲームループ
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver && !isGameClear) {
        drawBall();
        drawPaddle();
        drawBlocks();
        collisionDetection();
        drawScore();
        updateBallPosition();
        updatePaddlePosition();
        requestAnimationFrame(gameLoop);
    } else if (isGameOver) {
        drawGameOver();
        retryButton.style.display = 'block'; // ゲームオーバー時にリトライボタンを表示
    } else if (isGameClear) {
        drawGameClear();
        retryButton.style.display = 'block'; // ゲームクリア時にリトライボタンを表示
    }
}

retryButton.addEventListener('click', () => {
    resetGame();
    retryButton.style.display = 'none'; // リトライボタンを非表示
    startButton.style.display = 'none';  // スタートボタンを非表示
    startGame(); // ゲームを再開
});