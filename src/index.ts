import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.send('It works');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
