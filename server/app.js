const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 配置 CORS - 更新允许的源
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://dev-server:5173",  // 添加容器服务名
        "http://game-server:3000"  // 添加游戏服务器
    ],
    methods: ["GET", "POST"],
    credentials: true
}));

// 配置 Socket.IO - 更新配置
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://dev-server:5173",
            "http://game-server:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    },
    allowEIO3: true,
    path: '/socket.io/',
    pingTimeout: 60000,
    pingInterval: 25000
});

// 添加 Socket.IO 中间件进行连接日志记录
io.use((socket, next) => {
    console.log('新的 Socket.IO 连接尝试:', {
        id: socket.id,
        handshake: {
            headers: socket.handshake.headers,
            query: socket.handshake.query,
            auth: socket.handshake.auth
        }
    });
    next();
});

// WebSocket 连接处理
io.on('connection', (socket) => {
    console.log('新客户端连接:', {
        id: socket.id,
        transport: socket.conn.transport.name
    });

    // 创建房间
    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(7);
        socket.join(roomId);
        socket.emit('roomCreated', { roomId });
    });

    // 加入房间
    socket.on('joinRoom', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size < 2) {
            socket.join(roomId);
            io.to(roomId).emit('playerJoined', {
                players: Array.from(room),
                currentPlayer: socket.id
            });
        } else {
            socket.emit('error', '房间不存在或已满');
        }
    });

    // 处理落子
    socket.on('makeMove', ({ roomId, x, y }) => {
        io.to(roomId).emit('moveMade', {
            x, y,
            player: socket.id,
            currentPlayer: socket.id
        });
    });

    // 离开房间
    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit('playerLeft', socket.id);
    });

    // 心跳检测
    socket.on('heartbeat', ({ roomId }) => {
        console.log(`收到心跳 - 房间: ${roomId}, 玩家: ${socket.id}`);
    });

    socket.on('error', (error) => {
        console.error('Socket错误:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('客户端断开连接:', {
            id: socket.id,
            reason: reason
        });
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 