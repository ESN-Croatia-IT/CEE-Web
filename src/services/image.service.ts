import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Op } from 'sequelize';
import Event from '../models/event.model';

const DATA_FOLDER_PATH = process.env.DATA_PATH || path.join(__dirname, '..', '..', 'data');
export const UPLOADS_PATH = path.join(DATA_FOLDER_PATH, 'uploads');

export function initUploadsDir(): void {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

import EventPerk from '../models/event-perk.model';
import EventOrganiser from '../models/event-organiser.model';

export const upload = multer({ storage: multer.memoryStorage() });

export const GENERIC_IMAGES = {
  accentColour: 'gray-500',
  fullLogo: '/Full Logo Generic.png',
  logo: '/Logo Generic.png',
  fairy: '/Fairy Generic.png',
  background: '',
};

export function saveImage(file: Express.Multer.File): string {
  const ext = path.extname(file.originalname);
  const filename = crypto.randomUUID() + ext;
  fs.writeFileSync(path.join(UPLOADS_PATH, filename), file.buffer);
  return '/' + filename;
}

export async function deleteImageIfUnused(imagePath: string): Promise<void> {
  if (!imagePath) return;

  const [eventCount, perkCount, organiserCount] = await Promise.all([
    Event.count({
      where: {
        [Op.or]: [
          { fullLogo: imagePath },
          { fairy: imagePath },
          { logo: imagePath },
          { background: imagePath },
          { icon: imagePath },
        ],
      },
    }),
    EventPerk.count({ where: { image: imagePath } }),
    EventOrganiser.count({ where: { image: imagePath } }),
  ]);

  if (eventCount + perkCount + organiserCount === 0) {
    const filePath = path.join(UPLOADS_PATH, path.basename(imagePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
