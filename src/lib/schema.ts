import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core';

export const treatments = sqliteTable('treatments', {
  id: integer('id').primaryKey(),
  culture: text('culture').notNull(),
  area: numeric('area').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  actualDate: integer('actual_date', { mode: 'timestamp' }),
  notes: text('notes'),
  isTankMix: integer('is_tank_mix', { mode: 'boolean' }).default(false),
});

export const chemicalProducts = sqliteTable('chemical_products', {
  id: integer('id').primaryKey(),
  treatmentId: integer('treatment_id').references(() => treatments.id),
  name: text('name').notNull(),
  dosage: text('dosage').notNull(),
  productType: text('product_type').notNull(),
});