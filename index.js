const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const LEADERBOARD_FILE = './leaderboard.json';
let leaderboard = [];

// Load leaderboard from file if it exists
if (fs.existsSync(LEADERBOARD_FILE)) {
    leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE));
}

app.use(express.static('public'));
app.use(express.json());

app.post('/submit-score', (req, res) => {
    const { name, score } = req.body;
    if (name && score !== undefined) {
        leaderboard.push({ name, score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10); // keep top 10
        fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard));
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, error: 'Invalid data' });
    }
});

app.get('/leaderboard', (req, res) => {
    res.json(leaderboard);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
