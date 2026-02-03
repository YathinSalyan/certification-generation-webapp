import { db } from '../db/index.js';
import { courses } from '../db/schema.js';
import { eq, like } from 'drizzle-orm';

export const getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db.select().from(courses);
    
    if (search) {
      query = query.where(like(courses.title, `%${search}%`));
    }
    
    const allCourses = await query;
    res.json(allCourses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [course] = await db.select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, duration, startDate, endDate, template, description } = req.body;
    
    if (!title || !duration || !startDate || !endDate || !template) {
      return res.status(400).json({ 
        error: 'Title, duration, start date, end date, and template are required' 
      });
    }
    
    const [newCourse] = await db.insert(courses).values({
      title,
      duration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      template,
      description: description || null,
    }).returning();
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, startDate, endDate, template, description } = req.body;
    
    const [existing] = await db.select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const [updated] = await db.update(courses)
      .set({
        title: title || existing.title,
        duration: duration || existing.duration,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        template: template || existing.template,
        description: description !== undefined ? description : existing.description,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deleted] = await db.delete(courses)
      .where(eq(courses.id, id))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully', course: deleted });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};