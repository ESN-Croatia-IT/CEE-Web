import express from 'express';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import cookieParser from 'cookie-parser'; 
import session from 'express-session';
import crypto from "crypto";



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

function getData(): Data {
  let raw = readFileSync(DATA_PATH, 'utf-8');
  let data = JSON.parse(raw);
  return data
}

function saveData(data: Data) {
  let raw = JSON.stringify(data);
  writeFileSync(DATA_PATH, raw);
}

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");

  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  return { verifier, challenge };
}

app.use(express.json());
app.use(express.static(STATIC_PATH));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: true,
    httpOnly: true,
  }
}));
app.set("trust proxy", 1);
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

app.listen(+PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});
