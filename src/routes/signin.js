import { Router } from 'express';
import jwt from 'jsonwebtoken';
import models from '../models';

const router = Router();

const signin = id => new Promise((resolve) => {
  jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
    data: {
      id,
    },
  }, process.env.SECRET, (err, token) => {
    resolve(token);
  });
});

router.post('/', async (req, res) => {
  const { body: params } = req;
  const userID = await models.User.getIDByCreds(params.username, params.password);
  if (userID) {
    const token = await signin(userID);
    console.log(userID, 'authentificated. New token :', token);
    return res.send({ token });
  }
  console.log('authentification failed with username:', params.username, 'password:', params.password);
  return res.send({ token: null });
});

export default router;
