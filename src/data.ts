import { readFileSync, writeFileSync } from 'fs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const STATIC_PATH = path.join(__dirname, 'static');
const DATA_PATH = path.join(__dirname, 'data.json');
const IMAGES_PATH = path.join(STATIC_PATH, 'images');

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
  return data;
}

function saveData(data: Data) {
  let raw = JSON.stringify(data);
  writeFileSync(DATA_PATH, raw);
}


function saveFile(file: Express.Multer.File): string {
  const filePath = path.join(IMAGES_PATH, file.originalname);
  fs.writeFileSync(filePath, file.buffer);
  return '/images/' + file.originalname;
}

function deleteFile(filename: string) {
  const filePath = path.join(IMAGES_PATH, filename);
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
};
