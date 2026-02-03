import { db } from '../db/index.js';
import { participants } from '../db/schema.js';
import { eq, like, or } from 'drizzle-orm';
import { generateParticipantId } from '../utils/generators.js';

export const getAllParticipants = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db.select().from(participants);
    
    if (search) {
      query = query.where(
        or(
          like(participants.fullName, `%${search}%`),
          like(participants.participantId, `%${search}%`),
          like(participants.organization, `%${search}%`)
        )
      );
    }
    
    const allParticipants = await query;
    res.json(allParticipants);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [participant] = await db.select()
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Get participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createParticipant = async (req, res) => {
  try {
    const { fullName, classYear, streamMajor, organization, email, phone } = req.body;
    
    if (!fullName || !organization) {
      return res.status(400).json({ error: 'Full name and organization are required' });
    }
    
    const participantId = await generateParticipantId();
    
    const [newParticipant] = await db.insert(participants).values({
      fullName,
      participantId,
      classYear: classYear || null,
      streamMajor: streamMajor || null,
      organization,
      email: email || null,
      phone: phone || null,
    }).returning();
    
    res.status(201).json(newParticipant);
  } catch (error) {
    console.error('Create participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, classYear, streamMajor, organization, email, phone } = req.body;
    
    const [existing] = await db.select()
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1);
    
    if (!existing) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    const [updated] = await db.update(participants)
      .set({
        fullName: fullName || existing.fullName,
        classYear: classYear !== undefined ? classYear : existing.classYear,
        streamMajor: streamMajor !== undefined ? streamMajor : existing.streamMajor,
        organization: organization || existing.organization,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, id))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Update participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deleted] = await db.delete(participants)
      .where(eq(participants.id, id))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    res.json({ message: 'Participant deleted successfully', participant: deleted });
  } catch (error) {
    console.error('Delete participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};