import { Router } from 'express';
import {
  accueilApi,
  direBonjour,
  recevoirMessage,
} from '../controllers/index.controller.js';

const router = Router();

// Le préfixe /api est ajouté dans app.js.
router.get('/', accueilApi);
router.get('/bonjour/:nom', direBonjour);
router.post('/messages', recevoirMessage);

export default router;
