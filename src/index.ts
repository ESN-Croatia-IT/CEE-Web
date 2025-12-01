import express from 'express';
import path from 'path';


const app = express();
const PORT = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../dist/static")));
app.set("views", path.join(__dirname, "../dist/views"));



app.get('/', (_req, res) => {
  res.render('homepage', {});
});

app.get('/about', (_req, res) => {
  res.render('about', {});
});

app.get('/faq', (_req, res) => {
  res.render('faq', {});
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
