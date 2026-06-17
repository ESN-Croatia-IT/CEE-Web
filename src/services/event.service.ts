import { Op } from 'sequelize';
import Event from '../models/event.model';
import EventPerk from '../models/event-perk.model';
import EventOrganiser from '../models/event-organiser.model';
import EventFaq from '../models/event-faq.model';
import { deleteImageIfUnused } from './image.service';
import { EventState, isPubliclyVisible, VISIBLE_STATES } from '../models/event-state';

export async function getAllEvents(): Promise<Event[]> {
  return await Event.findAll({ order: [['eventDate', 'DESC']] });
}

export async function createEvent(fields: {
  tag: string;
  accentColour: string;
  eventDescription: string;
  eventDate: string;
  state: EventState;
}): Promise<Event> {
  return await Event.create(fields as never);
}

export async function isTagTaken(tag: string, excludeId?: number): Promise<boolean> {
  const existing = await Event.findOne({ where: { tag } });
  if (!existing) return false;
  return existing.id !== excludeId;
}

export async function getEvent(eventId: number): Promise<Event | null> {
  return await Event.findByPk(eventId);
}

export async function getLatestEvent(): Promise<Event | null> {
  return await Event.findOne({
    order: [['eventDate', 'DESC']],
  });
}

export async function getEventWithAssociations(eventId: number): Promise<Event | null> {
  return await Event.findByPk(eventId, {
    include: [
      { model: EventPerk },
      { model: EventOrganiser },
      { model: EventFaq },
    ],
  });
}

export async function getLatestEventWithAssociations(): Promise<Event | null> {
  return await Event.findOne({
    order: [['eventDate', 'DESC']],
    include: [
      { model: EventPerk },
      { model: EventOrganiser },
      { model: EventFaq },
    ],
  });
}

export async function updateEventFields(
  eventId: number,
  fields: Record<string, unknown>
): Promise<void> {
  await Event.update(fields, { where: { id: eventId } });
}

export async function replacePerks(
  eventId: number,
  perks: { title: string; description: string; image: string }[]
): Promise<void> {
  const oldPerks = await EventPerk.findAll({ where: { eventId } });
  const oldImages = oldPerks.map(p => p.image).filter(Boolean) as string[];

  await EventPerk.destroy({ where: { eventId } });
  if (perks.length > 0) {
    await EventPerk.bulkCreate(perks.map(p => ({ ...p, eventId })));
  }

  await Promise.all(oldImages.map(img => deleteImageIfUnused(img)));
}

export async function replaceFaqs(
  eventId: number,
  faqs: { question: string; answer: string }[]
): Promise<void> {
  await EventFaq.destroy({ where: { eventId } });
  if (faqs.length > 0) {
    await EventFaq.bulkCreate(faqs.map(f => ({ ...f, eventId })));
  }
}

export async function getFeaturedEvent(): Promise<Event | null> {
  return await Event.findOne({ where: { featured: true } });
}

export async function toggleFeaturedEvent(eventId: number): Promise<void> {
  const event = await Event.findByPk(eventId);
  if (!event) return;
  if (event.featured) {
    await event.update({ featured: false });
  } else if (isPubliclyVisible(event.state)) {
    await Event.update({ featured: false }, { where: {} });
    await event.update({ featured: true });
  }
}

export async function getAdjacentPublishedEvents(eventId: number): Promise<{
  prev: Event | null;
  next: Event | null;
}> {
  const current = await Event.findByPk(eventId, { attributes: ['id', 'eventDate'] });
  if (!current) return { prev: null, next: null };

  const [prev, next] = await Promise.all([
    Event.findOne({
      where: {
        eventDate: { [Op.lt]: current.eventDate },
        state: { [Op.in]: VISIBLE_STATES },
      },
      order: [['eventDate', 'DESC']],
      attributes: ['id', 'tag'],
    }),
    Event.findOne({
      where: {
        eventDate: { [Op.gt]: current.eventDate },
        state: { [Op.in]: VISIBLE_STATES },
      },
      order: [['eventDate', 'ASC']],
      attributes: ['id', 'tag'],
    }),
  ]);

  return { prev, next };
}

export async function deleteEvent(eventId: number): Promise<void> {
  const event = await getEventWithAssociations(eventId);
  if (!event) return;

  const imagesToClean: string[] = [
    event.fullLogo,
    event.fairy,
    event.logo,
    event.background,
    event.icon,
    ...event.perks.map(p => p.image),
    ...event.organisers.map(o => o.image),
  ].filter(Boolean) as string[];

  await EventPerk.destroy({ where: { eventId } });
  await EventOrganiser.destroy({ where: { eventId } });
  await EventFaq.destroy({ where: { eventId } });
  await event.destroy();

  await Promise.all(imagesToClean.map(img => deleteImageIfUnused(img)));
}

export async function replaceOrganisers(
  eventId: number,
  organisers: { name: string; role: string; image: string }[]
): Promise<void> {
  const oldOrganisers = await EventOrganiser.findAll({ where: { eventId } });
  const oldImages = oldOrganisers.map(o => o.image).filter(Boolean) as string[];

  await EventOrganiser.destroy({ where: { eventId } });
  if (organisers.length > 0) {
    await EventOrganiser.bulkCreate(organisers.map(o => ({ ...o, eventId })));
  }

  await Promise.all(oldImages.map(img => deleteImageIfUnused(img)));
}
