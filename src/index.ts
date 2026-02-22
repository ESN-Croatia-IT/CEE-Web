import express from 'express';
import path, { dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import cookieParser from 'cookie-parser'; 
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';
import { getData, STATIC_PATH } from './data';

import { router as editorRouter } from './routers/editor.router';

const app = express();
const PORT = process.env.PORT || 3000;
const VIEWS_PATH = path.join(__dirname, 'views'); 

declare module "express-session" {
  interface SessionData {
    user?: {
      userId: string;
      name: string;
    };
  }
}

function requireAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session?.user?.userId == null) {
    return res.redirect("/login")
  }
  next();
}

app.use(express.json());
app.use(express.static(STATIC_PATH));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    //secure: true,
    httpOnly: true,
  }
}));
app.set('view engine', 'ejs');
app.set('views', VIEWS_PATH);

app.get('/', (_req, res) => {
  res.render('homepage', getData());
});

app.get('/about', (_req, res) => {
  res.render('about', getData());
});

app.get('/faq', (_req, res) => {
  res.render('faq', getData());
});

app.get('/login', (_req, res) => {
  res.render('login', getData());
});

// Login
app.post("/login", async (req, res) => {

  const { username, password } = req.body;
  const admin_username = process.env.ADMIN_USERNAME || 'admin';
  const admin_password: string = process.env.ADMIN_PASSWORD || 'admin123';
  
  const match_username = admin_username == username;

  if (!match_username) return res.status(401).json({ error: "Invalid credentials" });

  //const match_password = await bcrypt.compare(password, admin_password);
  const match_password = admin_password == password;
  if (!match_password) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = { userId: admin_username, name: '' };
  req.session.save();
  return res.redirect('/editor');
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/editor');
    res.clearCookie("sid");
    return res.redirect('/');
  });
});

app.use('/editor', requireAuthMiddleware, editorRouter);


app.listen(+PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});

export { app };