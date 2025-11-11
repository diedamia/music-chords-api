require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const songRoutes = require('./routes/songs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'front')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/music_db')
.then(() => {
  console.log('База данных подключена');
})
.catch(err => {
  console.error('Ошибка подключения к MongoDB:', err);
  process.exit(1);
});

// Подключение маршрутов
app.use('/api/songs', songRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

// Запуск сервера после подключения к базе
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Приложение запущено на порту ${PORT}`);
  });
});