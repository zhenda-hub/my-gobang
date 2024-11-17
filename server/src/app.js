const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/auth');
const roomRouter = require('./routes/room');

const app = express();

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/gomoku', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// 中间件
app.use(express.json());
app.use(cookieParser());

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRouter);

// 基础路由，返回一个简单的消息
app.get('/', (req, res) => {
    res.json({ message: 'Gomoku Game Server is running' });
});

// 生产环境下的静态文件服务
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

module.exports = app; 