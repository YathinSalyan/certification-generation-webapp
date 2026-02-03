import express from 'express';
import {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from '../controllers/participantController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllParticipants);
router.get('/:id', getParticipantById);
router.post('/', createParticipant);
router.put('/:id', updateParticipant);
router.delete('/:id', deleteParticipant);

export default router;