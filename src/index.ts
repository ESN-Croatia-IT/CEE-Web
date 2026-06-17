import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { UPLOADS_PATH, initUploadsDir } from './services/image.service';
import EditorRouter from './routers/editor.router';
import ViewerRouter from './routers/viewer.router';
import { initializeDatabase } from './config/database.config';

const app = express();
const PORT = process.env.PORT || 3000;
const VIEWS_PATH = path.join(__dirname, 'views');

declare module 'express-session' {
  interface SessionData {
    user?: {
      userId: string;
      name: string;
    };
  }
}

function requireAuthMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.session?.user?.userId == null) {
    return res.redirect('/login');
  }
  next();
}

(function setupMiddlewares() {
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'static')));
  app.use(express.static(UPLOADS_PATH));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    })
  );
})();

(function setupViewEngine() {
  app.set('view engine', 'ejs');
  app.set('views', VIEWS_PATH);
})();

(function initializeRoutes() {
  app.use('/editor', requireAuthMiddleware, new EditorRouter().router);
  app.use('/', new ViewerRouter().router);
})();

initUploadsDir();
initializeDatabase()
  .then(() => {
    app.listen(+PORT, '0.0.0.0', () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  })
  .catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
