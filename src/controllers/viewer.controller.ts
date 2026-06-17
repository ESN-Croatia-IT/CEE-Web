import { Request, Response } from 'express';
import { getFeaturedEvent, getLatestEvent, getEventWithAssociations, getAdjacentPublishedEvents } from '../services/event.service';
import { isPubliclyVisible } from '../models/event-state';
import { validateCredentials } from '../services/user.service';
import { GENERIC_IMAGES } from '../services/image.service';

export default class ViewerController {

  async viewRecommendedEvent(_req: Request, res: Response) {
    const event = await getFeaturedEvent();
    if (!event) {
      return res.render('noevents', { ...GENERIC_IMAGES, icon: null });
    }
    return res.redirect('/event/' + event.id);
  }

  async viewEvent(req: Request, res: Response) {
    const eventId: number = parseInt(req.params.id);
    const [event, adjacent] = await Promise.all([
      getEventWithAssociations(eventId),
      getAdjacentPublishedEvents(eventId),
    ]);
    if (!event) {
      return res.redirect('/');
    }
    const isAdmin = !!req.session?.user?.userId;
    if (!isPubliclyVisible(event.state) && !isAdmin) {
      return res.redirect('/');
    }
    res.render('homepage', {
      eventId,
      isAdmin,
      state: event.state,
      accentColour: event.accentColour,
      background: event.background ?? GENERIC_IMAGES.background,
      fullLogo: event.fullLogo ?? GENERIC_IMAGES.fullLogo,
      logo: event.logo ?? GENERIC_IMAGES.logo,
      fairy: event.fairy ?? GENERIC_IMAGES.fairy,
      icon: event.icon ?? null,
      eventDescription: event.eventDescription,
      eventDate: event.eventDate,
      ticketSaleEndDate: event.ticketSaleEndDate,
      ticketsLink: event.ticketsLink ?? '',
      perks: event.perks ?? [],
      faq: event.faqs ?? [],
      oc: event.organisers ?? [],
      prevEventId: adjacent.prev?.id ?? null,
      prevEventTag: adjacent.prev?.tag ?? null,
      nextEventId: adjacent.next?.id ?? null,
      nextEventTag: adjacent.next?.tag ?? null,
    });
  }

  async getLoginPage(req: Request, res: Response) {
    const event = (await getFeaturedEvent()) ?? (await getLatestEvent());
    if (!event) return res.render('login', { ...GENERIC_IMAGES, icon: null, query: req.query });
    res.render('login', {
      accentColour: event.accentColour,
      background: event.background ?? GENERIC_IMAGES.background,
      logo: event.logo ?? GENERIC_IMAGES.logo,
      fairy: event.fairy ?? GENERIC_IMAGES.fairy,
      icon: event.icon ?? null,
      query: req.query,
    });
  }

  async postLogin(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!validateCredentials(username, password)) {
      return res.redirect('/login?error=invalid_credentials');
    }
    req.session.user = { userId: username, name: '' };
    req.session.save(err => {
      if (err) return res.redirect('/login?error=server_error');
      return res.redirect('/editor');
    });
  }

  postLogout(req: Request, res: Response) {
    req.session.destroy(err => {
      if (err) return res.redirect('/editor');
      res.clearCookie('connect.sid');
      return res.redirect('/');
    });
  }
}
