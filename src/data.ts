import { readFileSync, writeFileSync } from 'fs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const STATIC_PATH = path.join(__dirname, 'static');
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '..', 'data');
const DATA_FILE_PATH = path.join(DATA_PATH, 'data.json');
const UPLOADS_PATH = path.join(DATA_PATH, 'uploads');
const SEED_PATH = path.join(__dirname, 'seed');
const INITIAL_DATA_PATH = path.join(SEED_PATH, 'data.json');

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

  if(!fs.existsSync(DATA_FILE_PATH)) {
    if(!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(DATA_PATH);
    }
    fs.copyFileSync(INITIAL_DATA_PATH, DATA_FILE_PATH);
  }

  let raw = readFileSync(DATA_FILE_PATH, 'utf-8');
  let data = JSON.parse(raw);
  return data;
}
function saveData(data: Data) {
  let raw = JSON.stringify(data);
  writeFileSync(DATA_FILE_PATH, raw);
}

function saveFile(file: Express.Multer.File): string {

  if(!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH);
  }
  const filePath = path.join(UPLOADS_PATH, file.originalname);
  fs.writeFileSync(filePath, file.buffer);
  return '/' + file.originalname;
}

function deleteFile(filename: string) {
  const filePath = path.join(UPLOADS_PATH, filename);
  if(filename === '') return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}


const upload = multer({
  storage: multer.memoryStorage(),
});

export {
  getData,
  saveData,
  saveFile,
  deleteFile,
  Data,
  QuestionAnswer,
  Perk,
  Volunteer,
  upload,
  STATIC_PATH,
  UPLOADS_PATH
};
