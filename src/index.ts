import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('It works');
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
