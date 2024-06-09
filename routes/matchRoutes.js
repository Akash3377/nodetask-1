const express = require('express');
const router = express.Router();
const { addTeam, processResult, viewTeamResults } = require('../controllers/matchController');

router.post('/add-team', addTeam);
router.post('/process-result', processResult);
router.get('/team-result', viewTeamResults);

module.exports = router;
