const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const leaderboardPath = path.join(__dirname, 'leaderboard.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/leaderboard', (req, res) => {
  fs.readFile(leaderboardPath, 'utf8', (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

app.post('/leaderboard', (req, res) => {
  const { name, score } = req.body;
  fs.readFile(leaderboardPath, 'utf8', (err, data) => {
    let leaderboard = [];
    if (!err) leaderboard = JSON.parse(data);
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
    fs.writeFile(leaderboardPath, JSON.stringify(leaderboard), () => {
      res.sendStatus(200);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
    
