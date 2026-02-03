import { db } from '../db/index.js';
import { credentials, participants, courses } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateCredentialId } from '../utils/generators.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';

export const getAllCredentials = async (req, res) => {
  try {
    const allCredentials = await db.select({
      id: credentials.id,
      credentialId: credentials.credentialId,
      participantId: credentials.participantId,
      courseId: credentials.courseId,
      issueDate: credentials.issueDate,
      validationUrl: credentials.validationUrl,
      status: credentials.status,
      participant: {
        id: participants.id,
        fullName: participants.fullName,
        participantId: participants.participantId,
        organization: participants.organization,
      },
      course: {
        id: courses.id,
        title: courses.title,
        duration: courses.duration,
      },
    })
      .from(credentials)
      .leftJoin(participants, eq(credentials.participantId, participants.id))
      .leftJoin(courses, eq(credentials.courseId, courses.id));
    
    res.json(allCredentials);
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [credential] = await db.select({
      id: credentials.id,
      credentialId: credentials.credentialId,
      participantId: credentials.participantId,
      courseId: credentials.courseId,
      issueDate: credentials.issueDate,
      validationUrl: credentials.validationUrl,
      status: credentials.status,
      participant: {
        id: participants.id,
        fullName: participants.fullName,
        participantId: participants.participantId,
        organization: participants.organization,
        classYear: participants.classYear,
        streamMajor: participants.streamMajor,
      },
      course: {
        id: courses.id,
        title: courses.title,
        duration: courses.duration,
        startDate: courses.startDate,
        endDate: courses.endDate,
        template: courses.template,
      },
    })
      .from(credentials)
      .leftJoin(participants, eq(credentials.participantId, participants.id))
      .leftJoin(courses, eq(credentials.courseId, courses.id))
      .where(eq(credentials.id, id))
      .limit(1);
    
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    
    res.json(credential);
  } catch (error) {
    console.error('Get credential error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCredential = async (req, res) => {
  try {
    const { participantId, courseId } = req.body;
    
    if (!participantId || !courseId) {
      return res.status(400).json({ error: 'Participant ID and Course ID are required' });
    }
    
    const [participant] = await db.select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    const [course] = await db.select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const credentialId = generateCredentialId();
    const validationUrl = `${process.env.BASE_URL}/validate/${credentialId}`;
    
    const [newCredential] = await db.insert(credentials).values({
      credentialId,
      participantId,
      courseId,
      validationUrl,
      status: 'active',
    }).returning();
    
    res.status(201).json(newCredential);
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deleted] = await db.delete(credentials)
      .where(eq(credentials.id, id))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    
    res.json({ message: 'Credential deleted successfully', credential: deleted });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [credential] = await db.select({
      id: credentials.id,
      credentialId: credentials.credentialId,
      issueDate: credentials.issueDate,
      validationUrl: credentials.validationUrl,
      participant: {
        fullName: participants.fullName,
        participantId: participants.participantId,
        organization: participants.organization,
        classYear: participants.classYear,
        streamMajor: participants.streamMajor,
      },
      course: {
        title: courses.title,
        duration: courses.duration,
        startDate: courses.startDate,
        endDate: courses.endDate,
        template: courses.template,
      },
    })
      .from(credentials)
      .leftJoin(participants, eq(credentials.participantId, participants.id))
      .leftJoin(courses, eq(credentials.courseId, courses.id))
      .where(eq(credentials.id, id))
      .limit(1);
    
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    
    const pdfBuffer = await generateCertificatePDF(credential);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${credential.credentialId}.pdf`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const validateCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    
    const [credential] = await db.select({
      id: credentials.id,
      credentialId: credentials.credentialId,
      issueDate: credentials.issueDate,
      status: credentials.status,
      participant: {
        fullName: participants.fullName,
        participantId: participants.participantId,
        organization: participants.organization,
        classYear: participants.classYear,
        streamMajor: participants.streamMajor,
      },
      course: {
        title: courses.title,
        duration: courses.duration,
        startDate: courses.startDate,
        endDate: courses.endDate,
      },
    })
      .from(credentials)
      .leftJoin(participants, eq(credentials.participantId, participants.id))
      .leftJoin(courses, eq(credentials.courseId, courses.id))
      .where(eq(credentials.credentialId, credentialId))
      .limit(1);
    
    if (!credential) {
      return res.status(404).json({ 
        valid: false,
        error: 'Credential not found or invalid' 
      });
    }
    
    res.json({
      valid: true,
      credential,
    });
  } catch (error) {
    console.error('Validate credential error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};