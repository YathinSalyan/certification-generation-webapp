import express from 'express';
import {
  getAllCredentials,
  getCredentialById,
  createCredential,
  deleteCredential,
  generateCertificate,
  validateCredential,
} from '../controllers/credentialController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/validate/:credentialId', validateCredential);

router.use(authenticateToken);
router.get('/', getAllCredentials);
router.get('/:id', getCredentialById);
router.post('/', createCredential);
router.delete('/:id', deleteCredential);
router.get('/:id/generate', generateCertificate);

export default router;