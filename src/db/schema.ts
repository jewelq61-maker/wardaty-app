import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users/Profiles table
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // hashed password
  persona: text('persona').notNull().default('single'), // single, married, mother, partner
  locale: text('locale').notNull().default('ar'),
  theme: text('theme').notNull().default('light'),
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Cycles table
export const cycles = sqliteTable('cycles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  startDate: text('start_date').notNull(), // YYYY-MM-DD format
  endDate: text('end_date'),
  length: integer('length'),
  duration: integer('duration'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Cycle days table
export const cycleDays = sqliteTable('cycle_days', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  flow: text('flow'), // light, medium, heavy
  symptoms: text('symptoms'), // JSON array as string
  mood: text('mood'), // low, neutral, happy, tired, anxious
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Beauty actions table
export const beautyActions = sqliteTable('beauty_actions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  beautyCategory: text('beauty_category'),
  phase: text('phase'), // menstrual, follicular, ovulation, luteal
  scheduledAt: text('scheduled_at').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Fasting entries table
export const fastingEntries = sqliteTable('fasting_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Daughters table (for mother persona)
export const daughters = sqliteTable('daughters', {
  id: text('id').primaryKey(),
  motherId: text('mother_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  birthDate: text('birth_date'),
  cycleStartAge: integer('cycle_start_age'),
  isPregnant: integer('is_pregnant', { mode: 'boolean' }).default(false),
  pregnancyLmp: text('pregnancy_lmp'),
  pregnancyEdd: text('pregnancy_edd'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Share links table (for partner sharing)
export const shareLinks = sqliteTable('share_links', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  shareCode: text('share_code').notNull().unique(),
  partnerId: text('partner_id').references(() => profiles.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('pending'), // pending, active, revoked
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});
