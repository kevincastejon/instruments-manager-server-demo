import mongoose from 'mongoose';

import User from './user';
import Instrument from './instrument';

mongoose.set('useCreateIndex', true);

const connectDb = () => mongoose.connect(process.env.DATABASE_URL, {
  user: process.env.DBLOGIN,
  pass: process.env.DBPWD,
  dbName: 'managing-instruments-demo',
  keepAlive: 1,
  useNewUrlParser: true,
});

const models = { User, Instrument };

export { connectDb };

export default models;
