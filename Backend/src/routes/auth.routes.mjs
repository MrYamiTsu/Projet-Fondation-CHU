import express from 'express';

import {
  login,
  register
} from '../controllers/auth.controller.mjs';

import {
  validateLogin,
  validateRegister,
  
} from '../middlewares/auth.middleware.mjs';

const router = express.Router();

router.post('/register', validateRegister, register);

router.post('/login', validateLogin, login);



export default router;