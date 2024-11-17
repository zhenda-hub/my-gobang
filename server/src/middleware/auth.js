const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error('未登录');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 检查 token 是否即将过期（比如小于 1 小时）
        const tokenExp = decoded.exp * 1000;
        const oneHour = 60 * 60 * 1000;
        if (tokenExp - Date.now() < oneHour) {
            // 生成新 token
            const newToken = jwt.sign(
                { userId: decoded.userId },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.cookie('token', newToken, { httpOnly: true });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: error.message || '请先登录' });
    }
};

module.exports = auth; 