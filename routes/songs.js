const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// Обработчик ошибок
const handleError = (res, reason, message, code) => {
  console.log("Ошибка: " + reason);
  res.status(code || 500).json({"error": message});
};

// GET /api/songs - Получить все песни
router.get('/', async (req, res) => {
  try {
    const { artist, difficulty, search } = req.query;
    let filter = {};
    
    if (artist) filter.artist = new RegExp(artist, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { lyrics: new RegExp(search, 'i') }
      ];
    }
    
    const songs = await Song.find(filter);
    res.json(songs);
  } catch (error) {
    handleError(res, error.message, "Ошибка при получении песен");
  }
});

// GET /api/songs/:id - Получить песню по ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return handleError(res, "Not found", "Песня не найдена", 404);
    }
    res.json(song);
  } catch (error) {
    handleError(res, error.message, "Ошибка при получении песни");
  }
});

// POST /api/songs - Добавить новую песню
router.post('/', async (req, res) => {
  try {
    const song = new Song(req.body);
    const savedSong = await song.save();
    res.status(201).json(savedSong);
  } catch (error) {
    handleError(res, error.message, "Ошибка при создании песни", 400);
  }
});

// PUT /api/songs/:id - Обновить песню
router.put('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!song) {
      return handleError(res, "Not found", "Песня не найдена", 404);
    }
    res.json(song);
  } catch (error) {
    handleError(res, error.message, "Ошибка при обновлении песни", 400);
  }
});

// DELETE /api/songs/:id - Удалить песню
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return handleError(res, "Not found", "Песня не найдена", 404);
    }
    res.json({ message: 'Песня удалена', deletedSong: song });
  } catch (error) {
    handleError(res, error.message, "Ошибка при удалении песни");
  }
});

module.exports = router;