const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// 存储房间信息
const rooms = new Map();

/**
 * @swagger
 * /api/room/create:
 *   post:
 *     summary: 创建新游戏房间
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功创建房间
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roomId:
 *                   type: string
 *                   description: 房间ID
 *       401:
 *         description: 未授权
 */
router.post('/create', auth, (req, res) => {
    const roomId = uuidv4();
    rooms.set(roomId, {
        id: roomId,
        host: req.user.id,
        players: [req.user.id],
        status: 'waiting',
        created: Date.now()
    });
    
    res.json({ roomId });
});

/**
 * @swagger
 * /api/room/{roomId}/join:
 *   post:
 *     summary: 加入游戏房间
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功加入房间
 *       404:
 *         description: 房间不存在
 *       400:
 *         description: 房间已满
 */
router.post('/:roomId/join', auth, (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
        return res.status(404).json({ message: '房间不存在' });
    }
    
    if (room.players.length >= 2) {
        return res.status(400).json({ message: '房间已满' });
    }
    
    if (!room.players.includes(req.user.id)) {
        room.players.push(req.user.id);
        if (room.players.length === 2) {
            room.status = 'playing';
        }
    }
    
    res.json({ message: '成功加入房间' });
});

/**
 * @swagger
 * /api/room/{roomId}/status:
 *   get:
 *     summary: 获取房间状态
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 房间状态
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [waiting, playing, finished]
 *                 playerCount:
 *                   type: integer
 *       404:
 *         description: 房间不存在
 */
router.get('/:roomId/status', auth, (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
        return res.status(404).json({ message: '房间不存在' });
    }
    
    res.json({
        status: room.status,
        playerCount: room.players.length
    });
});

/**
 * @swagger
 * /api/room/{roomId}/leave:
 *   post:
 *     summary: 离开游戏房间
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功离开房间
 *       404:
 *         description: 房间不存在
 */
router.post('/:roomId/leave', auth, (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
        return res.status(404).json({ message: '房间不存在' });
    }
    
    room.players = room.players.filter(id => id !== req.user.id);
    
    if (room.players.length === 0) {
        rooms.delete(roomId);
    } else {
        room.status = 'waiting';
    }
    
    res.json({ message: '成功离开房间' });
});

module.exports = router; 