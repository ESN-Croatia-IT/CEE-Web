import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser'; 
import session from 'express-session';
import { getData, STATIC_PATH, UPLOADS_PATH } from './data';
import fs from 'fs';
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
app.use(express.static(UPLOADS_PATH));
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

app.get('/past_editions', (_req, res) => {
  res.render('past_editions', getData());
});

app.post("/login", async (req, res) => {

  const { username, password } = req.body;
  const admin_username = process.env.ADMIN_USERNAME || 'admin';
  const admin_password: string = process.env.ADMIN_PASSWORD || 'admin123';
  
  const match_username = admin_username == username;

  if (!match_username) return res.status(401).json({ error: "Invalid credentials" });

  const match_password = admin_password == password;
  if (!match_password) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = { userId: admin_username, name: '' };
  req.session.save();
  return res.redirect('/editor');
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/editor');
    res.clearCookie("sid");
    return res.redirect('/');
  });
});

if(process.env.NODE_ENV === 'development'){
  console.log('Development environment!')
  app.get("/output.css", async (req, res) => {
    try {
      const postcss = (await import("postcss")).default;
      const tailwind = (await import("@tailwindcss/postcss")).default;
      
      // read your input.css file
      const inputCssPath = path.resolve(__dirname, "../src/input.css");
      const inputCss: string = fs.readFileSync(inputCssPath, 'utf-8');
      
      // compile with PostCSS + Tailwind
      const result = await postcss([tailwind()]).process(inputCss, { from: inputCssPath });
      
      res.type("text/css").send(result.css);
    } catch (err) {
      console.error("Tailwind compile error:", err);
      res.status(500).send("CSS compilation failed");
    }
  });
}
else{
  console.log('Production environment!')
}

app.use('/editor', requireAuthMiddleware, editorRouter);

app.listen(+PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});

export { app };