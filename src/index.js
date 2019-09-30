import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';

import models, { connectDb } from './models';
import routes from './routes';

const app = express();

// Application-Level Middleware
// app.options('*', cors());
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

app.use('/', routes.signin);
app.use('/signin', routes.signin);
app.use('/instruments', routes.instruments);
app.use('/users', routes.users);

// Start

connectDb().then(async () => {
  const baseUsers = [
    new models.User({
      username: 'Admin User',
      password: process.env.ADMINPWD,
      admin: true,
    }),
    new models.User({
      username: 'Regular User',
      password: process.env.ADMINPWD,
      admin: false,
    }),
  ];
  const baseInstrus = [
    new models.Instrument({
      name: 'Trompette',
      user: null,
      com: '',
    }),
    new models.Instrument({
      name: 'Tambourin',
      user: null,
      com: 'HS ! Peau percée !',
    }),
    new models.Instrument({
      name: 'Guitare acoustique',
      user: null,
      com: '',
    }),
    new models.Instrument({
      name: 'Saxophone',
      user: null,
      com: 'Rangé dans le fond du studio',
    }),
    new models.Instrument({
      name: 'Grosse caisse',
      user: null,
      com: '',
    }),
  ];

  const feedDB = () => {
    models.User.insertMany(baseUsers, { ordered: false }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
    models.Instrument.insertMany(baseInstrus, { ordered: false }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  };

  const emptyDB = () => {
    models.Instrument.deleteMany({ name: /.*/ }).then(() => {
      console.log('dropped instrus');
      models.User.deleteMany({ username: /.*/ }).then(() => {
        console.log('dropped users');
        feedDB();
      }).catch((err) => {
        console.log('dropped users failed', err);
      });
    }).catch((err) => {
      console.log('dropped instrus failed', err);
    });
  };

  feedDB();

  setInterval(() => {
    emptyDB();
  }, 60 * 60 * 1000);

  app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));
}).catch(err => console.log(err));
