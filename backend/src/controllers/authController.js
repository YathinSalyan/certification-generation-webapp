import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { admins } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Register Admin (for initial setup)
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    if (existingAdmin.length > 0) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newAdmin] = await db.insert(admins).values({
      username,
      email,
      password: hashedPassword,
    }).returning();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [admin] = await db.select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current admin info
export const getCurrentAdmin = async (req, res) => {
  try {
    const [admin] = await db.select({
      id: admins.id,
      username: admins.username,
      email: admins.email,
    })
      .from(admins)
      .where(eq(admins.id, req.admin.id))
      .limit(1);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};