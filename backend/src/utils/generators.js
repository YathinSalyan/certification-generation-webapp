import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { participants } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const generateParticipantId = async () => {
  const prefix = 'PART';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  let participantId = `${prefix}-${timestamp}-${random}`;
  
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.select()
      .from(participants)
      .where(eq(participants.participantId, participantId))
      .limit(1);
    
    if (existing.length === 0) {
      return participantId;
    }
    
    const newRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    participantId = `${prefix}-${timestamp}-${newRandom}`;
    attempts++;
  }
  
  return `${prefix}-${uuidv4()}`;
};

export const generateCredentialId = () => {
  const prefix = 'CERT';
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  return `${prefix}-${uuid}`;
};