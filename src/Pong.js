import React, { useState, useEffect, useRef } from 'react';

const Pong = () => {
  const canvasWidth = 800;
  const canvasHeight = 600;
  const paddleWidth = 15;
  const paddleHeight = 100;
  const ballRadius = 7;
  const playerPaddleSpeed = 5;
  const aiPaddleSpeed = 2;

  // Game state and logic here
  const ball = useRef({ x: canvasWidth / 2, y: canvasHeight / 2, dx: 2, dy: 2 });
  const paddle1 = useRef({ y: (canvasHeight - paddleHeight) / 2, dy: 0 });
  const paddle2 = useRef({ y: (canvasHeight - paddleHeight) / 2, dy: 0 });
  const score = useRef({ player1: 0, player2: 0 });
  const [ballOutOfPlay, setBallOutOfPlay] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef(null);
  const timeoutId = useRef(null);
  const scoreUpdated = useRef(false);


  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      paddle1.current.dy = -playerPaddleSpeed;
    } else if (event.key === 'ArrowDown') {
      paddle1.current.dy = playerPaddleSpeed;
    }
  };  
  
  const handleKeyUp = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      paddle1.current.dy = 0;
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [paddle1, paddle2]);

  const resetBall = (playerScored) => {
    // Update the score
    if (playerScored === 1) {
      score.current.player1 += 1;
    } else if (playerScored === 2) {
      score.current.player2 += 1;
    }
  
    // Reset the ball position and direction
    ball.current.x = canvasWidth / 2;
    ball.current.y = canvasHeight / 2;
    ball.current.dx = -ball.current.dx;
  };

  const gameLoop = () => {
    if (isPaused) {
      requestAnimationFrame(gameLoop);
      return;
    }

    // Move the ball
    ball.current.x += ball.current.dx;
    ball.current.y += ball.current.dy;

    // Bounce the ball off the top and bottom of the canvas
    if (ball.current.y - ballRadius <= 0 || ball.current.y + ballRadius >= canvasHeight) {
      ball.current.dy = -ball.current.dy;
    }
  
    // Check if the ball hits the left or right wall
if (ball.current.x - ballRadius <= 0) {
  // Player 2 scores
  if (!isPaused && !scoreUpdated.current) {
    setIsPaused(true);
    scoreUpdated.current = true;
    setBallOutOfPlay(true);
    setTimeout(() => {
      resetBall(2);
      setBallOutOfPlay(false);
      setIsPaused(false);
      scoreUpdated.current = false;
    }, 500);
  }
} else if (ball.current.x + ballRadius >= canvasWidth) {
  // Player 1 scores
  if (!isPaused && !scoreUpdated.current) {
    setIsPaused(true);
    scoreUpdated.current = true;
    setBallOutOfPlay(true);
    setTimeout(() => {
      resetBall(1);
      setBallOutOfPlay(false);
      setIsPaused(false);
      scoreUpdated.current = false;
    }, 500);
  }
}
  
    // Bounce the ball off the paddles
    const paddle1Top = paddle1.current.y;
    const paddle1Bottom = paddle1.current.y + paddleHeight;
    const paddle2Top = paddle2.current.y;
    const paddle2Bottom = paddle2.current.y + paddleHeight;

    if (
      (ball.current.x - ballRadius <= paddleWidth && ball.current.y >= paddle1Top && ball.current.y <= paddle1Bottom) ||
      (ball.current.x + ballRadius >= canvasWidth - paddleWidth && ball.current.y >= paddle2Top && ball.current.y <= paddle2Bottom)
    ) {
      ball.current.dx = -ball.current.dx;
    }
  
    // Update paddles' positions
    paddle1.current.y = Math.min(
      Math.max(paddle1.current.y + paddle1.current.dy, 0),
      canvasHeight - paddleHeight
    );

    // AI for paddle2
    const paddle2Center = paddle2.current.y + paddleHeight / 2;
    if (ball.current.dy > 0 && paddle2Center < ball.current.y - 10) {
      paddle2.current.dy = aiPaddleSpeed;
    } else if (ball.current.dy < 0 && paddle2Center > ball.current.y + 10) {
      paddle2.current.dy = -aiPaddleSpeed;
    } else {
      paddle2.current.dy = 0;
    }

    paddle2.current.y = Math.min(
      Math.max(paddle2.current.y + paddle2.current.dy, 0),
      canvasHeight - paddleHeight
    );
  
    renderGameObjects();
    requestAnimationFrame(gameLoop);
  };

  const renderGameObjects = () => {
    if (!canvasRef.current) {
      return;
    }
  
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
    // Render ball
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  
    // Render paddles
    ctx.fillStyle = 'white';
    ctx.fillRect(0, paddle1.current.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvasWidth - paddleWidth, paddle2.current.y, paddleWidth, paddleHeight);
  
    // Render scores
    ctx.font = '48px monospace';
    ctx.fillText(score.current.player1, canvasWidth / 2 - 100, 50);
    ctx.fillText(score.current.player2, canvasWidth / 2 + 50, 50);
};

useEffect(() => {
  requestAnimationFrame(gameLoop);
}, []);
  
  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ background: 'black' }}
    />
  );
};

export default Pong;
