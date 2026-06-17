import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import ViewerController from '../controllers/viewer.controller';

export default class ViewerRouter {
  router: Router;
  controller: ViewerController;

  constructor() {
    this.router = Router();
    this.controller = new ViewerController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const c = this.controller;

    this.router.get('/', c.viewRecommendedEvent.bind(c));
    this.router.get('/event/:id', c.viewEvent.bind(c));
    this.router.get('/login', c.getLoginPage.bind(c));
    this.router.post('/login', c.postLogin.bind(c));
    this.router.post('/logout', c.postLogout.bind(c));

    if (process.env.NODE_ENV === 'development') {
      console.log('Development environment!');
      this.router.get('/output.css', async (_req, res) => {
        try {
          const postcss = (await import('postcss')).default;
          const tailwind = (await import('@tailwindcss/postcss')).default;

          const inputCssPath = path.resolve(__dirname, '../config/input.css');
          const inputCss: string = fs.readFileSync(inputCssPath, 'utf-8');

          const result = await postcss([tailwind()]).process(inputCss, {
            from: inputCssPath,
          });

          res.type('text/css').send(result.css);
        } catch (err) {
          console.error('Tailwind compile error:', err);
          res.status(500).send('CSS compilation failed');
        }
      });
    } else {
      console.log('Production environment!');
    }
  }
}
