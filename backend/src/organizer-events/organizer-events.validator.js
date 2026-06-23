const { z } = require('zod');

const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    venue: z.string().min(1, 'Venue is required').max(300),
    budget: z.number().min(0, 'Budget must be non-negative'),
    expectedGuests: z.number().int().min(1, 'Expected guests must be at least 1')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
    venue: z.string().min(1).max(300).optional(),
    budget: z.number().min(0).optional(),
    expectedGuests: z.number().int().min(1).optional(),
    status: z.enum(['draft', 'planning', 'booking', 'confirmed', 'completed', 'cancelled']).optional()
  }),
  params: z.object({
    eventId: z.string().uuid('Invalid event ID')
  }),
  query: z.object({}).optional()
});

const eventIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    eventId: z.string().uuid('Invalid event ID')
  }),
  query: z.object({}).optional()
});

module.exports = { createEventSchema, updateEventSchema, eventIdSchema };
