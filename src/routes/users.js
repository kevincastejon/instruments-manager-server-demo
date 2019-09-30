import { Router } from 'express';
import jwt from 'jsonwebtoken';
import models from '../models';

const router = Router();

router.get('/', async (req, res) => {
  const token = req.headers['x-access-token'];
  const users = await models.User.find({}).select(['username', 'admin']);
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ users });
    }
    const profile = await models.User.findByID(decoded.data.id);
    return res.send({ users, profile });
  });
});

router.get('/self', async (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const profile = (await models.User.findByID(decoded.data.id)).toObject();
    profile.instruments = await models.Instrument.getByUser(decoded.data.id);
    return res.send({ profile });
  });
});

router.post('/update', async (req, res) => {
  const {
    id, username, admin,
  } = req.body;
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const isAdmin = (await models.User.findByID(decoded.data.id)).admin;
    if (isAdmin) {
      const user = await models.User.findOne({ _id: id });
      user.username = username;
      user.admin = admin;
      try {
        await user.save();
        const users = await models.User.find({}).select(['username', 'admin']);
        return res.send({ users });
      } catch (e) {
        return res.send({ error: 'duplicate' });
      }
    }
    return res.send({ error: 'notAdmin' });
  });
});

router.post('/add', async (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const isAdmin = (await models.User.findByID(decoded.data.id)).admin;
    if (isAdmin) {
      const {
        username, admin,
      } = req.body;
      const user = new models.User({
        username,
        password: process.env.ADMINPWD,
        admin,
      });
      try {
        await user.save();
        const users = await models.User.find({}).select(['username', 'admin']);
        return res.send({ users });
      } catch (e) {
        return res.send({ error: 'duplicate' });
      }
    }
    return res.send({ error: 'notAdmin' });
  });
});

router.post('/delete', async (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const isAdmin = (await models.User.findByID(decoded.data.id)).admin;
    if (isAdmin) {
      const {
        id,
      } = req.body;
      await models.User.deleteOne({ _id: id });
      await models.Instrument.updateMany({ user: id }, { user: null });
      const users = await models.User.find({}).select(['username', 'admin']);
      return res.send({ users });
    }
    return res.send({ error: 'notAdmin' });
  });
});

export default router;
