const BOARD_SIZE = 15;
let GRID_SIZE;
const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let currentDifficulty = "medium"; // 默认中等难度
const DIFFICULTY_WEIGHTS = {
  easy: 0.005, // 稍微提高防守权重，但仍然保持较低
  medium: 0.01, // 保持中等模式不变
  hard: 1.2, // 保持困难模式不变
};

// 添加最后落子位置的记录
let lastMove = {
  player: null, // 1是玩家，2是AI
  x: null,
  y: null,
};

// 在文件开头添加悔棋相关变量
let moveHistory = []; // 记录每步棋的历史
let undoCount = 5; // 悔棋次数限制

// 在文件开头添加主题相关变量
let isDarkMode = false;

// 添加主题切换函数
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = isDarkMode ? '☀️' : '🌙';
  drawBoard();
  drawPieces();
}

// 添加重置游戏的函数
function resetGame() {
  board.forEach((row, i) => row.forEach((_, j) => (board[i][j] = 0)));
  lastMove = {
    player: null,
    x: null,
    y: null,
  };
  moveHistory = []; // 清空历史记录
  undoCount = 5; // 重置悔棋次数
  updateUndoButton();
  drawBoard();
  drawPieces();
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  resetGame();
}

// 修改drawBoard函数
function drawBoard() {
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--board-color');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-color');
  for (let i = 0; i < BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(GRID_SIZE, (i + 1) * GRID_SIZE);
    ctx.lineTo(canvas.width - GRID_SIZE, (i + 1) * GRID_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((i + 1) * GRID_SIZE, GRID_SIZE);
    ctx.lineTo((i + 1) * GRID_SIZE, canvas.height - GRID_SIZE);
    ctx.stroke();
  }
}

// 修改drawPieces函数
function drawPieces() {
  const highlightColor = getComputedStyle(document.body).getPropertyValue('--highlight-color');
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === 1) {
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--piece-black');
        ctx.beginPath();
        ctx.arc((j + 1) * GRID_SIZE, (i + 1) * GRID_SIZE, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 如果是最后一手黑子，添加红色高亮边框
        if (lastMove.player === 1 && lastMove.x === i && lastMove.y === j) {
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc((j + 1) * GRID_SIZE, (i + 1) * GRID_SIZE, GRID_SIZE / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (board[i][j] === 2) {
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--piece-white');
        ctx.beginPath();
        ctx.arc((j + 1) * GRID_SIZE, (i + 1) * GRID_SIZE, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 如果是最后一手白子，添加红色高亮边框
        if (lastMove.player === 2 && lastMove.x === i && lastMove.y === j) {
          ctx.strokeStyle = highlightColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc((j + 1) * GRID_SIZE, (i + 1) * GRID_SIZE, GRID_SIZE / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }
  ctx.lineWidth = 1;
}

function checkWin(x, y, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dx, dy] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const newX = x + i * dx,
        newY = y + i * dy;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE && board[newX][newY] === player) {
        count++;
      } else {
        break;
      }
    }
    for (let i = 1; i < 5; i++) {
      const newX = x - i * dx,
        newY = y - i * dy;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE && board[newX][newY] === player) {
        count++;
      } else {
        break;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

// 添加更新悔棋按钮状态的函数
function updateUndoButton() {
  const undoBtn = document.getElementById("undoBtn");
  undoBtn.textContent = `悔棋 (剩余${undoCount}次)`;
  undoBtn.disabled = undoCount === 0 || moveHistory.length === 0;
}

// 添加悔棋函数
function undoMove() {
  if (undoCount > 0 && moveHistory.length >= 2) {
    // 需要同时撤销玩家和AI的最后一步
    // 撤销AI的最一步
    const aiMove = moveHistory.pop();
    board[aiMove.x][aiMove.y] = 0;

    // 撤销玩家的最后一步
    const playerMove = moveHistory.pop();
    board[playerMove.x][playerMove.y] = 0;

    // 更新最后落子位置
    lastMove =
      moveHistory.length > 0
        ? moveHistory[moveHistory.length - 1]
        : {
          player: null,
          x: null,
          y: null,
        };

    undoCount--;
    updateUndoButton();
    drawBoard();
    drawPieces();
  }
}

// 修改画布初始化部分
function initializeCanvas() {
  const container = document.querySelector(".canvas-container");
  const size = Math.min(container.offsetWidth, container.offsetHeight);
  canvas.width = size;
  canvas.height = size;
  GRID_SIZE = size / (BOARD_SIZE + 1);
  drawBoard();
  drawPieces();
}

// 添加窗口大小改变事件监听
window.addEventListener("resize", initializeCanvas);

// 初始化画布
initializeCanvas();

// 修改触摸事件处理
canvas.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault(); // 阻止默认行为
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;

    handleMove(clickX, clickY);
  },
  false
);

// 修改点击事件处理
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  handleMove(clickX, clickY);
});

// 统一处理移动的函数
function handleMove(clickX, clickY) {
  // 将点击坐标转换为相对于画布大小的比例
  const relativeX = clickX * (canvas.width / canvas.offsetWidth);
  const relativeY = clickY * (canvas.height / canvas.offsetHeight);

  const gridX = Math.round(relativeX / GRID_SIZE) - 1;
  const gridY = Math.round(relativeY / GRID_SIZE) - 1;

  if (gridX >= 0 && gridX < BOARD_SIZE && gridY >= 0 && gridY < BOARD_SIZE && board[gridY][gridX] === 0) {
    board[gridY][gridX] = 1;
    lastMove = {
      player: 1,
      x: gridY,
      y: gridX,
    };
    moveHistory.push({ ...lastMove }); // 记录玩家落子

    drawBoard();
    drawPieces();
    updateUndoButton();

    if (checkWin(gridY, gridX, 1)) {
      setTimeout(() => {
        alert("玩家获胜！");
        resetGame();
      }, 100);
      return;
    }

    aiMove();
  }
}

function evaluatePosition(x, y, player) {
  const opponent = player === 1 ? 2 : 1;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  let score = 0;

  for (const [dx, dy] of directions) {
    let playerCount = 1;
    let playerBlocked = 0;

    // 向一个方向检查
    for (let i = 1; i < 5; i++) {
      const newX = x + i * dx,
        newY = y + i * dy;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
        if (board[newX][newY] === player) playerCount++;
        else if (board[newX][newY] === opponent) {
          playerBlocked++;
          break;
        } else break;
      } else playerBlocked++;
    }

    // 向相反方向检查
    for (let i = 1; i < 5; i++) {
      const newX = x - i * dx,
        newY = y - i * dy;
      if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
        if (board[newX][newY] === player) playerCount++;
        else if (board[newX][newY] === opponent) {
          playerBlocked++;
          break;
        } else break;
      } else playerBlocked++;
    }

    // 修改评分规则
    if (currentDifficulty === "easy") {
      // 稍微提高简单模式的评分
      if (playerCount >= 5) score += 100000;
      else if (playerCount === 4 && playerBlocked === 0) score += 200; // 提高活四重视度
      else if (playerCount === 4 && playerBlocked === 1) score += 30; // 提高冲四重视度
      else if (playerCount === 3 && playerBlocked === 0) score += 10; // 提高活三重视度
      else if (playerCount === 3 && playerBlocked === 1) score += 3; // 提高眠三重视度
      else if (playerCount === 2 && playerBlocked === 0) score += 1; // 提高活二重视度
    } else if (currentDifficulty === "medium") {
      // 中等模式保持不变
      if (playerCount >= 5) score += 100000;
      else if (playerCount === 4 && playerBlocked === 0) score += 100;
      else if (playerCount === 4 && playerBlocked === 1) score += 20;
      else if (playerCount === 3 && playerBlocked === 0) score += 5;
      else if (playerCount === 3 && playerBlocked === 1) score += 2;
      else if (playerCount === 2 && playerBlocked === 0) score += 1;
    } else {
      // 困难模式保持原有评分
      if (playerCount >= 5) score += 100000;
      else if (playerCount === 4 && playerBlocked === 0) score += 10000;
      else if (playerCount === 4 && playerBlocked === 1) score += 1000;
      else if (playerCount === 3 && playerBlocked === 0) score += 500;
      else if (playerCount === 3 && playerBlocked === 1) score += 100;
      else if (playerCount === 2 && playerBlocked === 0) score += 50;
    }
  }

  return score;
}

function aiMove() {
  let bestScore = -Infinity;
  let bestMoves = [];

  // 降低简单模式下完全随机下棋的概率到25%
  if (currentDifficulty === "easy" && Math.random() < 0.25) {
    const emptyPositions = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyPositions.push([i, j]);
        }
      }
    }
    if (emptyPositions.length > 0) {
      bestMoves = [emptyPositions[Math.floor(Math.random() * emptyPositions.length)]];
    }
  } else if (currentDifficulty === "medium" && Math.random() < 0.2) {
    // 中等模式使用之前简单模式的随机概率20%
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          const aiScore = evaluatePosition(i, j, 2);
          const playerScore = evaluatePosition(i, j, 1);
          const totalScore = aiScore + playerScore * DIFFICULTY_WEIGHTS[currentDifficulty];

          // 在简单模式下，大幅增加随机性
          if (currentDifficulty === "easy") {
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestMoves = [[i, j]];
            } else if (totalScore > bestScore * 0.3) {
              // 提高分数门槛到30%
              bestMoves.push([i, j]);
            }

            // 降低随机添加位置的概率到35%
            if (Math.random() < 0.35) {
              bestMoves.push([i, j]);
            }
          } else {
            // 中等和困难模式保持原有逻辑
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestMoves = [[i, j]];
            }
          }
        }
      }
    }
  } else {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          const aiScore = evaluatePosition(i, j, 2);
          const playerScore = evaluatePosition(i, j, 1);
          const totalScore = aiScore + playerScore * DIFFICULTY_WEIGHTS[currentDifficulty];

          // 在简单模式下，大幅增加随机性
          if (currentDifficulty === "easy") {
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestMoves = [[i, j]];
            } else if (totalScore > bestScore * 0.3) {
              // 提高分数门槛到30%
              bestMoves.push([i, j]);
            }

            // 降低随机添加位置的概率到35%
            if (Math.random() < 0.35) {
              bestMoves.push([i, j]);
            }
          } else {
            // 中等和困难模式保持原有逻辑
            if (totalScore > bestScore) {
              bestScore = totalScore;
              bestMoves = [[i, j]];
            }
          }
        }
      }
    }
  }

  if (bestMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    const [x, y] = bestMoves[randomIndex];
    board[x][y] = 2;
    lastMove = {
      player: 2,
      x: x,
      y: y,
    };
    moveHistory.push({ ...lastMove }); // 记录AI落子

    drawBoard();
    drawPieces();
    updateUndoButton();

    if (checkWin(x, y, 2)) {
      setTimeout(() => {
        alert("AI获胜！");
        resetGame();
      }, 100);
      return;
    }
  }
}

drawBoard();
