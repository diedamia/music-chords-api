const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название песни обязательно'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Исполнитель обязателен'],
    trim: true
  },
  lyrics: {
    type: String,
    required: [true, 'Текст песни обязателен']
  },
  chords: {
    type: String,
    required: [true, 'Аккорды обязательны']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Song', songSchema);