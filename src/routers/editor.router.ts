import { Router } from 'express';
import { upload } from '../services/image.service';
import EditorController from '../controllers/editor.controller';

export default class EditorRouter {
  router: Router;
  controller: EditorController;

  constructor() {
    this.router = Router();
    this.controller = new EditorController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const c = this.controller;

    this.router.get('/', c.listEvents.bind(c));
    this.router.post('/new', c.createEvent.bind(c));
    this.router.get('/:id', c.redirectToDetails.bind(c));
    this.router.post('/:id/delete', c.deleteEvent.bind(c));
    this.router.post('/:id/feature', c.setFeatured.bind(c));

    this.router.get('/:id/appearance', c.getAppearance.bind(c));
    this.router.post('/:id/appearance', upload.any(), c.postAppearance.bind(c));

    this.router.get('/:id/details', c.getDetails.bind(c));
    this.router.post('/:id/details', c.postDetails.bind(c));

    this.router.get('/:id/benefits', c.getBenefits.bind(c));
    this.router.post('/:id/benefits', upload.any(), c.postBenefits.bind(c));

    this.router.get('/:id/faq', c.getFaq.bind(c));
    this.router.post('/:id/faq', c.postFaq.bind(c));

    this.router.get('/:id/oc', c.getOc.bind(c));
    this.router.post('/:id/oc', upload.any(), c.postOc.bind(c));
  }
}
