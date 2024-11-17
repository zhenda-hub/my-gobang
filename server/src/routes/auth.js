const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 用户名已存在
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 检查用户是否存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 创建用户
        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 用户名或密码错误
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 生成 token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        
        // 设置 cookie
        res.cookie('token', token, { httpOnly: true });
        res.json({ message: '登录成功' });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *       401:
 *         description: 未登录
 */
router.post('/logout', auth, (req, res) => {
    res.clearCookie('token');
    res.json({ message: '登出成功' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: 未登录
 *       404:
 *         description: 用户不存在
 */
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: 刷新认证令牌
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token 刷新成功
 *       401:
 *         description: 未登录或 Token 无效
 */
router.post('/refresh-token', auth, async (req, res) => {
    try {
        const newToken = jwt.sign(
            { userId: req.userId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.cookie('token', newToken, { httpOnly: true });
        res.json({ message: 'Token 已刷新' });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: 修改密码
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: 当前密码
 *               newPassword:
 *                 type: string
 *                 description: 新密码
 *     responses:
 *       200:
 *         description: 密码修改成功
 *       400:
 *         description: 当前密码错误
 *       401:
 *         description: 未登录
 */
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        
        // 验证当前密码
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: '当前密码错误' });
        }

        // 更新密码
        user.password = newPassword;
        await user.save();
        
        res.json({ message: '密码修改成功' });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

module.exports = router; 