const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  ID: { type: String, required: true },
  innings: { type: Number, required: true },
  overs: { type: Number, required: true },
  ballnumber: { type: Number, required: true },
  batter: { type: String, required: true },
  bowler: { type: String, required: true },
  nonStriker: { type: String, required: true },
  extra_type: { type: String, required: true },
  batsman_run: { type: Number, required: true },
  extras_run: { type: Number, required: true },
  total_run: { type: Number, required: true },
  non_boundary: { type: Number, required: true },
  isWicketDelivery: { type: Number, required: true },
  player_out: { type: String, required: true },
  kind: { type: String, required: true },
  fielders_involved: { type: String, required: true },
  BattingTeam: { type: String, required: true }
}, { collection: 'matches' });

module.exports = mongoose.model('Match', matchSchema);