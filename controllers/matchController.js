const fs = require('fs');
const path = require('path');
const Player = require('../models/player');
const Match = require('../models/match');

const addTeam = async (req, res) => {
  const { teamName, players, captain, viceCaptain } = req.body;

  if (!teamName || !players || !captain || !viceCaptain || players.length !== 11 || !players.includes(captain) || !players.includes(viceCaptain)) {
    return res.status(400).json({ error: 'Invalid team entry' });
  }

  try {
    const playerDocs = await Player.find({ Player: { $in: players } });
    if (playerDocs.length !== 11) {
      return res.status(400).json({ error: 'Invalid players' });
    }

    const playerTypes = playerDocs.reduce((acc, player) => {
      acc[player.Role] = (acc[player.Role] || 0) + 1;
      return acc;
    }, {});

    if (playerTypes.WK < 1 || playerTypes.WK > 8 || playerTypes.BAT < 1 || playerTypes.BAT > 8 || playerTypes.AR < 1 || playerTypes.AR > 8 || playerTypes.BWL < 1 || playerTypes.BWL > 8) {
      return res.status(400).json({ error: 'Invalid player type distribution' });
    }

    const matchEntry = new Match({ teamName, players, captain, viceCaptain });
    await matchEntry.save();
    res.status(201).json(matchEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add team entry', details: err });
  }
};

const processResult = async (req, res) => {
  try {
    const matchData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data', 'match.json'), 'utf8'));
    const matchEntries = await Match.find();

    const playerPoints = {};

    matchData.forEach(ball => {
      const { batter, bowler, batsman_run, extras_run, total_run, isWicketDelivery, player_out, kind, fielders_involved } = ball;

      playerPoints[batter] = (playerPoints[batter] || 0) + batsman_run;
      if (batsman_run === 4) playerPoints[batter] += 1;
      if (batsman_run === 6) playerPoints[batter] += 2;

      if (isWicketDelivery && player_out !== 'NA') {
        playerPoints[bowler] = (playerPoints[bowler] || 0) + 25;
        if (kind === 'lbw' || kind === 'bowled') playerPoints[bowler] += 8;
      }

      if (fielders_involved !== 'NA') {
        const fielders = fielders_involved.split(', ');
        fielders.forEach(fielder => {
          playerPoints[fielder] = (playerPoints[fielder] || 0) + 8;
          if (kind === 'stumped') playerPoints[fielder] += 12;
        });
      }
    });

    for (const matchEntry of matchEntries) {
      let totalPoints = 0;
      matchEntry.players.forEach(player => {
        let playerPointsTotal = playerPoints[player] || 0;
        if (player === matchEntry.captain) playerPointsTotal *= 2;
        if (player === matchEntry.viceCaptain) playerPointsTotal *= 1.5;
        totalPoints += playerPointsTotal;
      });
      matchEntry.points = totalPoints;
      await matchEntry.save();
    }

    res.status(200).json({ message: 'Match results processed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process match results', details: err });
  }
};

const viewTeamResults = async (req, res) => {
  try {
    const matchEntries = await Match.find().sort({ points: -1 });
    const maxPoints = matchEntries.length > 0 ? matchEntries[0].points : 0;
    const winners = matchEntries.filter(team => team.points === maxPoints);

    res.status(200).json({ winners, allTeams: matchEntries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team results', details: err });
  }
};

module.exports = {
  addTeam,
  processResult,
  viewTeamResults
};
