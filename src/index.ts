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
const AUTH_URL = "https://accounts.esn.org/oauth/authorize";
const CALLBACK_URL = "https://dev.cee.esn.hr/callback";
const SCOPE = "oauth2_access_to_profile_information";
const USERINFO_URL = "https://accounts.esn.org/oauth/v1/userinfo";
const TOKEN_URL = "https://accounts.esn.org/oauth/token";



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
    pkceVerifier?: string;
    user?: {
      esnId: string;
      email: string;
      name: string;
    };
  }
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

app.get("/auth/esn", (req, res) => {
  const { verifier, challenge } = generatePKCE();

  req.session.pkceVerifier = verifier;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ESN_CLIENT_ID!,
    redirect_uri: CALLBACK_URL,
    scope: SCOPE,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  res.redirect(`${AUTH_URL}?${params.toString()}`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  const verifier = req.session.pkceVerifier;

  if (!code || !verifier) {
    return res.status(400).send("Invalid OAuth state");
  }

  try {
    const credentials = Buffer.from(
      `${process.env.ESN_CLIENT_ID}:${process.env.ESN_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: CALLBACK_URL,
        code,
        code_verifier: verifier,
      }),
    });


    const token = await tokenRes.json();

    if (!token.access_token) {
      console.error(token);
      return res.status(500).send("Token exchange failed");
    }

    const userRes = await fetch(USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const profile = await userRes.json();

    // Minimal example user
    req.session.user = {
      esnId: profile.sub,
      email: profile.email,
      name: profile.name,
    };

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
});

app.listen(+PORT, '0.0.0.0', () => {
  console.log('Server running on http://localhost:' + PORT);
});
