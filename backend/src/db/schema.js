import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Admin table
export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Participants table (Students/Professionals)
export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  participantId: varchar('participant_id', { length: 100 }).notNull().unique(),
  classYear: varchar('class_year', { length: 100 }),
  streamMajor: varchar('stream_major', { length: 255 }),
  organization: varchar('organization', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  template: text('template').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Credentials table (Mapping between participants and courses)
export const credentials = pgTable('credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  credentialId: varchar('credential_id', { length: 255 }).notNull().unique(),
  participantId: uuid('participant_id').notNull().references(() => participants.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  validationUrl: text('validation_url').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});