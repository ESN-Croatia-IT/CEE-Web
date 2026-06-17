import { Request, Response } from 'express';
import path from 'path';
import sharp from 'sharp';
import { UPLOADS_PATH, saveImage, deleteImageIfUnused, GENERIC_IMAGES } from '../services/image.service';
import { EventState, isPubliclyVisible } from '../models/event-state';
import {
  getAllEvents,
  createEvent as createEventRecord,
  getEventWithAssociations,
  updateEventFields,
  replacePerks,
  replaceFaqs,
  replaceOrganisers,
  deleteEvent as deleteEventRecord,
  toggleFeaturedEvent,
  isTagTaken,
} from '../services/event.service';


function toDateInput(d: Date | undefined | null): string {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

export default class EditorController {

  async listEvents(req: Request, res: Response) {
    const events = await getAllEvents();
    const eventList = events.map(e => ({
      id: e.id,
      tag: e.tag,
      state: e.state,
      featured: e.featured,
      canFeature: e.featured || isPubliclyVisible(e.state),
    }));
    res.render('editor', { events: eventList, error: req.query.error ?? null });
  }

  async createEvent(req: Request, res: Response) {
    const tag: string = req.body.tag?.trim() ?? '';
    if (!tag) return res.redirect('/editor?error=tag_required');
    if (await isTagTaken(tag)) return res.redirect('/editor?error=tag_taken');

    const event = await createEventRecord({
      tag,
      accentColour: req.body.accentColour ?? GENERIC_IMAGES.accentColour,
      eventDescription: '',
      eventDate: req.body.eventDate,
      state: EventState.DRAFT,
    });
    res.redirect(`/editor/${event.id}/details`);
  }

  redirectToDetails(req: Request, res: Response) {
    res.redirect(`/editor/${req.params.id}/details`);
  }

  async getAppearance(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    res.render('appearance', {
      eventId: id,
      accentColour: event?.accentColour ?? GENERIC_IMAGES.accentColour,
      fullLogo: event?.fullLogo ?? GENERIC_IMAGES.fullLogo,
      logo: event?.logo ?? GENERIC_IMAGES.logo,
      fairy: event?.fairy ?? GENERIC_IMAGES.fairy,
      background: event?.background ?? GENERIC_IMAGES.background,
      icon: event?.icon ?? null,
    });
  }

  async postAppearance(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    if (!event) return res.redirect(`/editor/${id}/appearance`);

    const files = req.files as Express.Multer.File[];
    const byField: Record<string, Express.Multer.File> = {};
    files.forEach(f => { byField[f.fieldname] = f; });

    const updates: Record<string, unknown> = { accentColour: req.body.accentColour };
    const toDelete: string[] = [];

    if ('fullLogo' in byField) {
      if (event.fullLogo) toDelete.push(event.fullLogo);
      updates.fullLogo = saveImage(byField['fullLogo']);
    }
    if ('fairyLogo' in byField) {
      if (event.fairy) toDelete.push(event.fairy);
      updates.fairy = saveImage(byField['fairyLogo']);
    }
    if ('flowerLogo' in byField) {
      if (event.logo) toDelete.push(event.logo);
      if (event.icon) toDelete.push(event.icon);
      updates.logo = saveImage(byField['flowerLogo']);
      const faviconFilename = 'favicon-' + id + '.ico';
      const faviconPath = path.join(UPLOADS_PATH, faviconFilename);
      sharp(path.join(UPLOADS_PATH, path.basename(updates.logo as string)))
        .resize(32, 32)
        .toFile(faviconPath)
        .catch(err => console.error('Favicon generation failed:', err));
      updates.icon = '/' + faviconFilename;
    }
    if ('background' in byField) {
      if (event.background) toDelete.push(event.background);
      updates.background = saveImage(byField['background']);
    }

    await updateEventFields(id, updates);
    await Promise.all(toDelete.map(img => deleteImageIfUnused(img)));
    res.redirect(`/editor/${id}/appearance`);
  }

  async getDetails(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    res.render('details', {
      eventId: id,
      error: req.query.error ?? null,
      tag: event?.tag ?? '',
      state: event?.state ?? EventState.DRAFT,
      eventDescription: event?.eventDescription ?? '',
      eventDate: toDateInput(event?.eventDate),
      ticketSaleEndDate: toDateInput(event?.ticketSaleEndDate),
      ticketsLink: event?.ticketsLink ?? '',
      icon: event?.icon ?? null,
    });
  }

  async postDetails(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const tag: string = req.body.tag?.trim() ?? '';
    if (!tag) return res.redirect(`/editor/${id}/details?error=tag_required`);
    if (await isTagTaken(tag, id)) return res.redirect(`/editor/${id}/details?error=tag_taken`);

    if (!Object.values(EventState).includes(req.body.state)) {
      return res.redirect(`/editor/${id}/details?error=invalid_state`);
    }
    const newState = req.body.state as EventState;
    await updateEventFields(id, {
      tag,
      state: newState,
      ...(!isPubliclyVisible(newState) && { featured: false }),
      eventDescription: req.body.eventDescription,
      eventDate: req.body.eventDate || null,
      ticketSaleEndDate: req.body.ticketSaleEndDate || null,
      ticketsLink: req.body.ticketsLink || null,
    });
    res.redirect(`/editor/${id}/details`);
  }

  async getBenefits(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    res.render('benefits-editor', { eventId: id, perks: event?.perks ?? [], icon: event?.icon ?? null });
  }

  async postBenefits(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    const files = req.files as Express.Multer.File[];
    const byIdentifier: Record<string, Express.Multer.File> = {};
    files.forEach(f => { byIdentifier[f.fieldname.split('-')[2]] = f; });

    if (typeof req.body['benefit-description'] === 'string') {
      req.body['benefit-description'] = [req.body['benefit-description']];
      req.body['benefit-name'] = [req.body['benefit-name']];
      req.body['benefit-default-image'] = [req.body['benefit-default-image']];
      req.body['benefit-identifier'] = [req.body['benefit-identifier']];
    }

    const count: number = req.body['benefit-description']?.length ?? 0;
    const perks: { title: string; description: string; image: string }[] = [];

    for (let i = 0; i < count; i++) {
      let image: string = req.body['benefit-default-image'][i];
      const identifier: string = req.body['benefit-identifier'][i];
      if (identifier in byIdentifier) {
        image = saveImage(byIdentifier[identifier]);
      }
      perks.push({
        title: req.body['benefit-name'][i],
        description: req.body['benefit-description'][i],
        image,
      });
    }

    await replacePerks(id, perks);
    res.redirect(`/editor/${id}/benefits`);
  }

  async getFaq(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    res.render('faq-editor', { eventId: id, faq: event?.faqs ?? [], icon: event?.icon ?? null });
  }

  async postFaq(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    if (typeof req.body['faq-question'] === 'string') {
      req.body['faq-question'] = [req.body['faq-question']];
      req.body['faq-answer'] = [req.body['faq-answer']];
    }

    const faqs: { question: string; answer: string }[] = (
      req.body['faq-question'] ?? []
    ).map((q: string, i: number) => ({
      question: q,
      answer: req.body['faq-answer'][i],
    }));

    await replaceFaqs(id, faqs);
    res.redirect(`/editor/${id}/faq`);
  }

  async getOc(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const event = await getEventWithAssociations(id);
    res.render('oc-editor', { eventId: id, oc: event?.organisers ?? [], icon: event?.icon ?? null });
  }

  async deleteEvent(req: Request, res: Response) {
    await deleteEventRecord(parseInt(req.params.id));
    res.redirect('/editor');
  }

  async setFeatured(req: Request, res: Response) {
    await toggleFeaturedEvent(parseInt(req.params.id));
    res.redirect('/editor');
  }

  async postOc(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    const files = req.files as Express.Multer.File[];
    const byIdentifier: Record<string, Express.Multer.File> = {};
    files.forEach(f => { byIdentifier[f.fieldname.split('-')[2]] = f; });

    if (typeof req.body['oc-name'] === 'string') {
      req.body['oc-name'] = [req.body['oc-name']];
      req.body['oc-role'] = [req.body['oc-role']];
      req.body['oc-default-image'] = [req.body['oc-default-image']];
      req.body['oc-identifier'] = [req.body['oc-identifier']];
    }

    const count: number = req.body['oc-role']?.length ?? 0;
    const organisers: { name: string; role: string; image: string }[] = [];

    for (let i = 0; i < count; i++) {
      let image: string = req.body['oc-default-image'][i];
      const identifier: string = req.body['oc-identifier'][i];
      if (identifier in byIdentifier) {
        image = saveImage(byIdentifier[identifier]);
      }
      organisers.push({
        name: req.body['oc-name'][i],
        role: req.body['oc-role'][i],
        image,
      });
    }

    await replaceOrganisers(id, organisers);
    res.redirect(`/editor/${id}/oc`);
  }
}
