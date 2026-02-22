import express from 'express';
const router = express.Router();

import {
  getData,
  saveData,
  Data,
  QuestionAnswer,
  STATIC_PATH,
  upload,
  Volunteer,
  Perk,
  saveFile,
  deleteFile,
} from '../data';
import path from 'path';

//import Data class from index

router.get('/', (_req, res) => {
  res.redirect('/editor/details');
});

router.get('/appearance', (_req, res) => {
  res.render('appearance', getData());
});

router.post('/appearance', upload.any(), (req, res) => {
  let data = getData();
  data.accentColour = req.body.accentColour;

  const files = req.files as Express.Multer.File[];


  var imageDictionary: { [key: string]: Express.Multer.File } = {};

  files.forEach(file => {
    const fieldName = file.fieldname;
    const f = file;
    imageDictionary[fieldName] = f;
  });

  if('fullLogo' in imageDictionary) {
    deleteFile(path.basename(data.fullLogo));
    let imgPath = saveFile(imageDictionary['fullLogo']);
    data.fullLogo = imgPath;
  }

  if('fairyLogo' in imageDictionary) {
    deleteFile(path.basename(data.fairy));
    let imgPath = saveFile(imageDictionary['fairyLogo']);
    data.fairy = imgPath;
  }

  if('flowerLogo' in imageDictionary) {
    deleteFile(path.basename(data.logo));
    let imgPath = saveFile(imageDictionary['flowerLogo']);
    data.logo = imgPath;
  }

  if('background' in imageDictionary) {
    deleteFile(path.basename(data.background));
    let imgPath = saveFile(imageDictionary['background']);
    data.background = imgPath;
  }

  saveData(data);
  res.redirect('/editor/appearance');
});

router.get('/details', (_req, res) => {
  res.render('details', getData());
});

router.post('/details', (req, res) => {
  let data: Data = getData();
  console.log(req.body);
  
  let newEventDate: string = req.body.eventDate;
  let newTicketsLink: string = req.body.ticketsLink;
  let newTicketsAvailable: boolean = req.body.ticketsAvailable === 'true';
  
  data.eventDate = newEventDate;
  data.ticketsLink = newTicketsLink;
  data.ticketsAvailable = newTicketsAvailable;
  saveData(data);
  res.redirect('/editor/details');
});

router.get('/benefits', (_req, res) => {
  res.render('benefits-editor', getData());
});

router.post('/benefits', upload.any(), (req, res) => {
const files = req.files as Express.Multer.File[];
  const imageDictionary: { [key: string]: Express.Multer.File } = {};

  files.forEach(file => {
    const identifier = file.fieldname.split('-')[2];

    imageDictionary[identifier] = file;
  });

  let data: Data = getData();
  data.perks = [];

  let count = req.body['benefit-description'].length || 0;

  for (let i = 0; i < count; i++) {
    let image = req.body['benefit-default-image'][i];
    let identifier = req.body['benefit-identifier'][i];
    if (identifier in imageDictionary) {
      let file = imageDictionary[identifier];
      deleteFile(path.basename(image));
      saveFile(file);
      image = '/images/' + file.originalname;
    }

    let newPerkEntry: Perk = {
      title: req.body['benefit-name'][i],
      description: req.body['benefit-description'][i],
      image: image,
    };
    data.perks.push(newPerkEntry);
  }
  saveData(data);
  res.redirect('/editor/benefits');
  return;
});

router.get('/faq', (_req, res) => {
  res.render('faq-editor', getData());
});

router.post('/faq', (req, res) => {
  let data: Data = getData();
  data.faq = [];
  for (let i = 0; i < req.body['faq-question'].length; i++) {
    let newFaqEntry: QuestionAnswer = {
      question: req.body['faq-question'][i],
      answer: req.body['faq-answer'][i],
    };
    data.faq.push(newFaqEntry);
  }
  saveData(data);
  res.redirect('/editor/faq');
});

router.get('/oc', (_req, res) => {
  res.render('oc-editor', getData());
});

router.post('/oc', upload.any(), (req, res) => {
  const files = req.files as Express.Multer.File[];
  const imageDictionary: { [key: string]: Express.Multer.File } = {};

  files.forEach(file => {
    const identifier = file.fieldname.split('-')[2];

    imageDictionary[identifier] = file;
  });

  let data: Data = getData();
  data.oc = [];

  let count = req.body['oc-role'].length || 0;

  for (let i = 0; i < count; i++) {
    let image = req.body['oc-default-image'][i];
    let identifier = req.body['oc-identifier'][i];
    if (identifier in imageDictionary) {
      let file = imageDictionary[identifier];
      deleteFile(path.basename(image));
      saveFile(file);
      image = '/images/' + file.originalname;
    }

    let newOcEntry: Volunteer = {
      name: req.body['oc-name'][i],
      role: req.body['oc-role'][i],
      image: image,
    };
    data.oc.push(newOcEntry);
  }
  saveData(data);
  res.redirect('/editor/oc');
  return;
});

export { router };
