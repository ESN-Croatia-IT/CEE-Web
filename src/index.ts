import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import cookieParser from 'cookie-parser'; 
import session from 'express-session';
import bcrypt from 'bcrypt';



const app = express();
const PORT = process.env.PORT || 3000;

const DATA_PATH = path.join(__dirname, 'data.json');
const STATIC_PATH = path.join(__dirname, 'static');
const VIEWS_PATH = path.join(__dirname, 'views'); 

interface Perk {
  title: string;
  description: string;
  image: string;
}

interface Volunteer {
  name: string;
  role: string;
  image: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface Data {
  ticketsLink: string;
  ticketsAvailable: boolean;
  eventDate: string;
  accentColour: string;
  fullLogo: string;
  fairy: string;
  icon: string;
  logo: string;
  buyFrame: string;
  background: string;
  perks: Perk[];
  oc: Volunteer[];
  faq: QuestionAnswer[];
}

declare module "express-session" {
  interface SessionData {
    user?: {
      userId: string;
      name: string;
    };
  }
}

function requireAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  console.log(req.session);
  if (req.session?.user?.userId == null) {
    return res.redirect("/login")
  }
  next();
}

function getData(): Data {
  let raw = readFileSync(DATA_PATH, 'utf-8');
  let data = JSON.parse(raw);
  return data
}

function saveData(data: Data) {
  let raw = JSON.stringify(data);
  writeFileSync(DATA_PATH, raw);
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


app.get("/login", async (req, res) => {
  if(req.session?.user?.userId != null){
  }
  res.render('login', getData());
});

// Login
app.post("/login", async (req, res) => {

  console.log(req.body);

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
  return res.redirect('/user');
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Could not log out" });
    res.clearCookie("sid");
    res.json({ success: true });
  });
});

app.get('/user', requireAuthMiddleware, (_req, res) => {
  res.send("Hi!");
});

app.listen(+PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});
