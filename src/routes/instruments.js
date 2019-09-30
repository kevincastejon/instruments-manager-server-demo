import { Router } from 'express';
import jwt from 'jsonwebtoken';
import models from '../models';

const router = Router();

router.get('/', async (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const instruments = await models.Instrument.getAll();
    const profile = (await models.User.findByID(decoded.data.id)).toObject();
    profile.instruments = await models.Instrument.getByUser(decoded.data.id);
    return res.send({ instruments, profile });
  });
});
router.get('/:userId', async (req, res) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const { userId } = req.params;
    const instruments = await models.Instrument.getByUser(userId);
    return res.send({ instruments });
  });
});

router.post('/update', async (req, res) => {
  const {
    id, name, user, com,
  } = req.body;
  const token = req.headers['x-access-token'];
  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err || (await models.User.findByID(decoded.data.id)) === null) {
      return res.send({ error: 'notAuthenticated' });
    }
    const instrument = await models.Instrument.findOne({ _id: id });
    instrument.name = name;
    instrument.user = user;
    instrument.com = com;
    try {
      await instrument.save();
      const instruments = await models.Instrument.getAll();
      return res.send({ instruments });
    } catch (e) {
      return res.send({ error: 'duplicate' });
    }
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
        name, user, com,
      } = req.body;
      const instrument = new models.Instrument({
        name,
        user,
        com,
      });
      try {
        await instrument.save();
        const instruments = await models.Instrument.getAll();
        return res.send({ instruments });
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
      await models.Instrument.deleteOne({ _id: id });
      const instruments = await models.Instrument.getAll();
      return res.send({ instruments });
    }
    return res.send({ error: 'notAdmin' });
  });
});

export default router;
