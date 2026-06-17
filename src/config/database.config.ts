import { Sequelize } from 'sequelize-typescript';
import Event from '../models/event.model';
import EventPerk from '../models/event-perk.model';
import EventOc from '../models/event-organiser.model';
import EventFaq from '../models/event-faq.model';
import path from 'path';

const DATA_FOLDER_PATH = process.env.DATA_PATH || path.join(__dirname, '..', '..', 'data');

const DB_PATH = path.join(DATA_FOLDER_PATH, 'database.sqlite');

let sequelize: Sequelize;

export async function initializeDatabase() {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DB_PATH,
    models: [Event, EventPerk, EventOc, EventFaq],
  });
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
}
