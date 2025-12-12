const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - 20 - PADDLE_WIDTH;

// State
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 3;
let playerScore = 0;
let aiScore = 0;

// Mouse control: player paddle follows mouse Y
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    playerY = (e.clientY - rect.top) * scaleY - PADDLE_HEIGHT / 2;
    // Clamp
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Draw everything
function draw() {
    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT); // Player
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT); // AI

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
}

// Ball and paddle collision detection
function rectCircleColliding(circleX, circleY, radius, rectX, rectY, rectW, rectH) {
    // Find closest point to circle within the rectangle
    let closestX = Math.max(rectX, Math.min(circleX, rectX + rectW));
    let closestY = Math.max(rectY, Math.min(circleY, rectY + rectH));
    // Calculate distance to closest point
    let dx = circleX - closestX;
    let dy = circleY - closestY;
    return (dx * dx + dy * dy) < (radius * radius);
}

// AI paddle movement: follows ball Y with some smoothing
function moveAI() {
    let target = ballY - PADDLE_HEIGHT / 2;
    // Smooth AI movement
    aiY += (target - aiY) * 0.08;
    // Clamp
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Ball movement and collision
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/bottom wall bounce
    if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > canvas.height) {
        ballSpeedY = -ballSpeedY;
        ballY += ballSpeedY;
    }

    // Player paddle collision
    if (
        rectCircleColliding(ballX, ballY, BALL_RADIUS, PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT)
        && ballSpeedX < 0
    ) {
        ballSpeedX = -ballSpeedX;
        // Add some "spin" based on where the ball hit the paddle
        let collidePoint = ballY - (playerY + PADDLE_HEIGHT / 2);
        ballSpeedY += collidePoint * 0.09;
        ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS; // Prevent sticking
    }

    // AI paddle collision
    if (
        rectCircleColliding(ballX, ballY, BALL_RADIUS, AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT)
        && ballSpeedX > 0
    ) {
        ballSpeedX = -ballSpeedX;
        let collidePoint = ballY - (aiY + PADDLE_HEIGHT / 2);
        ballSpeedY += collidePoint * 0.09;
        ballX = AI_X - BALL_RADIUS; // Prevent sticking
    }

    // Left wall (AI scores)
    if (ballX - BALL_RADIUS < 0) {
        aiScore++;
        resetBall();
    }

    // Right wall (Player scores)
    if (ballX + BALL_RADIUS > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Update score display
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('ai-score').textContent = aiScore;
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    // Randomize direction
    let angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    let speed = 5 + Math.random() * 1.5;
    ballSpeedX = (Math.random() < 0.5 ? -1 : 1) * speed * Math.cos(angle);
    ballSpeedY = speed * Math.sin(angle);
}

// Main loop
function loop() {
    moveAI();
    updateBall();
    draw();
    requestAnimationFrame(loop);
}

// Start game
resetBall();
loop();