const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  Player: { type: String, required: true },
  Team: { type: String, required: true },
  Role: { type: String, required: true }
}, { collection: 'players' });

module.exports = mongoose.model('Player', playerSchema);