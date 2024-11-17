const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// 存储房间信息
const rooms = new Map();

// 添加房间超时配置
const ROOM_TIMEOUT = 10 * 60 * 1000; // 10分钟，单位毫秒

// 添加房间活动时间跟踪
function updateRoomActivity(roomId) {
    const room = rooms.get(roomId);
    if (room) {
        room.lastActivity = Date.now();
    }
}

// 添加清理过期房间的函数
function cleanInactiveRooms() {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        if (now - room.lastActivity > ROOM_TIMEOUT) {
            // 通知房间内的所有玩家
            if (room.players.length > 0) {
                io.to(roomId).emit('roomExpired', '房间因长时间无操作已关闭');
            }
            // 清理房间
            rooms.delete(roomId);
            console.log(`房间 ${roomId} 已因超时被清理`);
        }
    }
}

module.exports = function(io) {
    // 设置定期清理
    setInterval(cleanInactiveRooms, 60000); // 每分钟检查一次

    // WebSocket 连接处理
    io.on('connection', (socket) => {
        console.log('用户连接：', socket.id);

        // 创建房间
        socket.on('createRoom', () => {
            const roomId = uuidv4().substring(0, 6);
            rooms.set(roomId, {
                players: [socket.id],
                currentPlayer: socket.id,
                board: Array(15).fill().map(() => Array(15).fill(0)),
                lastActivity: Date.now() // 添加最后活动时间
            });
            
            socket.join(roomId);
            socket.emit('roomCreated', { roomId });
        });

        // 加入房间
        socket.on('joinRoom', (roomId) => {
            const room = rooms.get(roomId);
            if (!room) {
                socket.emit('error', '房间不存在');
                return;
            }
            if (room.players.length >= 2) {
                socket.emit('error', '房间已满');
                return;
            }

            room.players.push(socket.id);
            updateRoomActivity(roomId); // 更新活动时间
            socket.join(roomId);
            io.to(roomId).emit('playerJoined', {
                players: room.players,
                currentPlayer: room.currentPlayer
            });
        });

        // 处理落子
        socket.on('makeMove', ({ roomId, x, y }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            if (socket.id !== room.currentPlayer) {
                socket.emit('error', '还没轮到你下棋');
                return;
            }

            if (room.board[x][y] !== 0) {
                socket.emit('error', '该位置已有棋子');
                return;
            }

            // 更新棋盘和活动时间
            updateRoomActivity(roomId);
            const playerIndex = room.players.indexOf(socket.id);
            room.board[x][y] = playerIndex + 1;
            
            // 切换当前玩家
            room.currentPlayer = room.players.find(id => id !== socket.id);

            // 广播移动信息
            io.to(roomId).emit('moveMade', {
                x,
                y,
                player: playerIndex + 1,
                currentPlayer: room.currentPlayer
            });
        });

        // 离开房间
        socket.on('leaveRoom', (roomId) => {
            const room = rooms.get(roomId);
            if (room) {
                room.players = room.players.filter(id => id !== socket.id);
                updateRoomActivity(roomId);
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                }
                socket.leave(roomId);
                io.to(roomId).emit('playerLeft', socket.id);
            }
        });

        // 断开连接处理
        socket.on('disconnect', () => {
            for (const [roomId, room] of rooms.entries()) {
                if (room.players.includes(socket.id)) {
                    room.players = room.players.filter(id => id !== socket.id);
                    updateRoomActivity(roomId);
                    if (room.players.length === 0) {
                        rooms.delete(roomId);
                    } else {
                        io.to(roomId).emit('playerLeft', socket.id);
                    }
                }
            }
        });

        // 添加心跳检测
        socket.on('heartbeat', ({ roomId }) => {
            if (roomId && rooms.has(roomId)) {
                updateRoomActivity(roomId);
            }
        });
    });

    return router;
}; 