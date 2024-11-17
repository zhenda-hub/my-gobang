const BOARD_SIZE = 15;
let GRID_SIZE;
const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let currentDifficulty = "medium"; // 默认中等难度
const DIFFICULTY_WEIGHTS = {
  easy: 0.005,
  medium: 0.01,
  hard: 1.2,
};

// 添加最后落子位置的记录
let lastMove = {
  player: null,
  x: null,
  y: null,
};

// 在文件开头添加悔棋相关变量
let moveHistory = [];
let undoCount = 5;

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
    moveHistory = [];
    undoCount = 5;
    updateUndoButton();
    drawBoard();
    drawPieces();
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    resetGame();
}

// 添加创建房间按钮的事件监听
document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.querySelector('.create-room-btn');
    if (createButton) {
        createButton.addEventListener('click', () => {
            console.log('创建房间按钮被点击');
            // 这里添加创建房间的逻辑
        });
    }
    
    // 初始化棋盘
    initializeCanvas();
});

function initializeCanvas() {
    const container = document.querySelector(".canvas-container");
    if (!container) {
        console.error("找不到canvas容器");
        return;
    }
    
    const canvas = document.getElementById("board");
    if (!canvas) {
        console.error("找不到canvas元素");
        return;
    }
    
    const ctx = canvas.getContext("2d");
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    
    canvas.width = size;
    canvas.height = size;
    GRID_SIZE = size / (BOARD_SIZE + 1);
    
    // 立即绘制棋盘
    drawBoard();
}

// 添加绘制棋盘的函数
function drawBoard() {
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置棋盘颜色
    ctx.fillStyle = isDarkMode ? '#2d2d2d' : '#d2691e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.beginPath();
    ctx.strokeStyle = isDarkMode ? '#808080' : '#000000';
    
    // 绘制横线
    for (let i = 0; i <= BOARD_SIZE; i++) {
        ctx.moveTo(GRID_SIZE, GRID_SIZE * (i + 1));
        ctx.lineTo(GRID_SIZE * BOARD_SIZE, GRID_SIZE * (i + 1));
    }
    
    // 绘制竖线
    for (let i = 0; i <= BOARD_SIZE; i++) {
        ctx.moveTo(GRID_SIZE * (i + 1), GRID_SIZE);
        ctx.lineTo(GRID_SIZE * (i + 1), GRID_SIZE * BOARD_SIZE);
    }
    
    ctx.stroke();
}

// 确保DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        initializeCanvas();
        drawPieces(); // 重新绘制棋子
    });
});

// 检查这些核心功能是否被破坏
class Game {
    constructor() {
        this.board = Array(15).fill().map(() => Array(15).fill(0));
        this.currentPlayer = 1; // 1为玩家，2为AI
        this.gameOver = false;
        this.remainingUndos = 5;
    }
    
    // 检查落子是否有效
    isValidMove(x, y) {
        return this.board[x][y] === 0;
    }
    
    // 检查胜利条件
    checkWin(x, y, player) {
        // 检查横、竖��斜四个方向
        const directions = [
            [[0, 1], [0, -1]], // 横向
            [[1, 0], [-1, 0]], // 竖向
            [[1, 1], [-1, -1]], // 主对角线
            [[1, -1], [-1, 1]]  // 副对角线
        ];
        // ... 胜利判断逻辑
    }
}

// 添加代码保护
(function(){
    // 将核心代码放在立即执行函数中
    // 防止全局变量污染
})();

const GameLogger = {
    log: function(action, data) {
        console.log(`[Game Action]: ${action}`, data);
        // 可以添加远程日志收集
    },
    error: function(error) {
        console.error(`[Game Error]:`, error);
    }
};

// 添加调试日志
function debug() {
    console.log('Canvas元素:', document.getElementById('board'));
    console.log('Canvas容器:', document.querySelector('.canvas-container'));
    console.log('Canvas上下文:', ctx);
    console.log('棋盘大小:', BOARD_SIZE);
    console.log('格子大小:', GRID_SIZE);
    console.log('样式是否加载:', document.styleSheets);
    
    // 检查容器尺寸
    const container = document.querySelector('.canvas-container');
    if (container) {
        console.log('容器尺寸:', {
            width: container.offsetWidth,
            height: container.offsetHeight,
            style: window.getComputedStyle(container)
        });
    }
}

// 在初始化时调用
document.addEventListener('DOMContentLoaded', () => {
    debug();
    initializeCanvas();
});

// 添加绘制棋子的函数
function drawPieces() {
    if (!ctx) return;
    
    board.forEach((row, i) => {
        row.forEach((piece, j) => {
            if (piece !== 0) {
                const x = GRID_SIZE * (i + 1);
                const y = GRID_SIZE * (j + 1);
                
                ctx.beginPath();
                ctx.arc(x, y, GRID_SIZE * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = piece === 1 ? 'black' : 'white';
                ctx.fill();
                ctx.strokeStyle = piece === 1 ? '#666' : '#ccc';
                ctx.stroke();
                
                // 绘制最后落子标记
                if (lastMove.x === i && lastMove.y === j) {
                    ctx.beginPath();
                    ctx.arc(x, y, GRID_SIZE * 0.1, 0, Math.PI * 2);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }
            }
        });
    });
}

// 添加处理点击事件的函数
function handleClick(event) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 转换为棋盘坐标
    const i = Math.round(x / GRID_SIZE - 1);
    const j = Math.round(y / GRID_SIZE - 1);
    
    // 检查是否在有效范围内
    if (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE) {
        if (board[i][j] === 0) {
            // 玩家落子
            makeMove(i, j, 1);
            
            // AI回合
            setTimeout(() => {
                const aiMove = getAIMove();
                if (aiMove) {
                    makeMove(aiMove.x, aiMove.y, 2);
                }
            }, 100);
        }
    }
}

// 添加落子函数
function makeMove(x, y, player) {
    if (board[x][y] === 0) {
        board[x][y] = player;
        lastMove = { player, x, y };
        moveHistory.push({ x, y, player });
        
        drawBoard();
        drawPieces();
        
        if (checkWin(x, y, player)) {
            gameOver = true;
            setTimeout(() => {
                alert(player === 1 ? "你赢了！" : "电脑赢了！");
            }, 100);
        }
    }
}

// 添加悔棋函数
function undo() {
    if (undoCount > 0 && moveHistory.length >= 2) {
        // 移除AI和玩家的最后一步棋
        moveHistory.pop();
        moveHistory.pop();
        
        // 重建棋盘
        board.forEach(row => row.fill(0));
        moveHistory.forEach(move => {
            board[move.x][move.y] = move.player;
        });
        
        // 更新最后落子位置
        const lastMove = moveHistory[moveHistory.length - 1] || { player: null, x: null, y: null };
        
        undoCount--;
        updateUndoButton();
        drawBoard();
        drawPieces();
    }
}

// 更新悔棋按钮状态
function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.textContent = `悔棋 (剩余${undoCount}次)`;
        undoBtn.disabled = undoCount === 0 || moveHistory.length < 2;
    }
}

// 初始化事件监听
canvas.addEventListener('click', handleClick);

// 添加游戏状态变量
let gameOver = false;

// 添加检查获胜的函数
function checkWin(x, y, player) {
    const directions = [
        [[0, 1], [0, -1]],  // 水平
        [[1, 0], [-1, 0]],  // 垂直
        [[1, 1], [-1, -1]], // 主对角线
        [[1, -1], [-1, 1]]  // 副对角线
    ];

    return directions.some(direction => {
        let count = 1;
        direction.forEach(([dx, dy]) => {
            let i = x + dx;
            let j = y + dy;
            while (
                i >= 0 && i < BOARD_SIZE &&
                j >= 0 && j < BOARD_SIZE &&
                board[i][j] === player
            ) {
                count++;
                i += dx;
                j += dy;
            }
        });
        return count >= 5;
    });
}

// 添加AI移动函数
function getAIMove() {
    // 获取所有可用位置
    const availableMoves = [];
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === 0) {
                availableMoves.push({ x: i, y: j });
            }
        });
    });

    // 评估每个位置的分数
    const scoredMoves = availableMoves.map(move => {
        const score = evaluatePosition(move.x, move.y);
        return { ...move, score };
    });

    // 根据难度选择最佳移动
    scoredMoves.sort((a, b) => b.score - a.score);
    const randomFactor = Math.random() * DIFFICULTY_WEIGHTS[currentDifficulty];
    const selectedIndex = Math.min(
        Math.floor(randomFactor * scoredMoves.length),
        scoredMoves.length - 1
    );

    return scoredMoves[selectedIndex];
}

// 添加位置评估函数
function evaluatePosition(x, y) {
    let score = 0;
    const directions = [
        [[0, 1], [0, -1]],  // 水平
        [[1, 0], [-1, 0]],  // 垂直
        [[1, 1], [-1, -1]], // 主对角线
        [[1, -1], [-1, 1]]  // 副对角线
    ];

    // 评估AI和玩家的连子情况
    [2, 1].forEach(player => {
        directions.forEach(direction => {
            const lineScore = evaluateLine(x, y, direction, player);
            score += player === 2 ? lineScore : lineScore * 0.8;
        });
    });

    return score;
}

// 添加连子评估函数
function evaluateLine(x, y, direction, player) {
    let score = 0;
    let count = 0;
    let blocked = 0;

    direction.forEach(([dx, dy]) => {
        let i = x + dx;
        let j = y + dy;
        let lineCount = 0;
        let isBlocked = false;

        while (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE) {
            if (board[i][j] === player) {
                lineCount++;
            } else if (board[i][j] !== 0) {
                isBlocked = true;
                break;
            } else {
                break;
            }
            i += dx;
            j += dy;
        }

        if (isBlocked) blocked++;
        count += lineCount;
    });

    // 评分规则
    if (count >= 4) return 10000;  // 必胜
    if (count === 3 && blocked < 2) return 1000;  // 活三
    if (count === 2 && blocked < 2) return 100;   // 活二
    if (count === 1 && blocked < 2) return 10;    // 活一

    return 1;
}

// 修改初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    canvas.addEventListener('click', handleClick);
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        initializeCanvas();
        drawPieces();
    });
});
