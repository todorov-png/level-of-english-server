import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import cookieParser from 'cookie-parser';
import middleware from 'i18next-http-middleware';
import * as env from 'dotenv';
import router from './router/index.js';
import errorMiddleware from './middlewares/error-middleware.js';

env.config();
mongoose.set('strictQuery', false);

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}.json',
    },
  });

const PORT = process.env.PORT || 5000;
const app = express();

app.use(middleware.handle(i18next));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`[OK] Server is running on PORT = ${PORT}`);
    });

    mongoose
      .connect(process.env.BD_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('[OK] DB is connected'))
      .catch((err) => console.error(err));
  } catch (e) {
    console.log(e);
  }
};
start();
