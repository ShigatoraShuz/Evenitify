const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID'),
    requirementId: z.string().uuid('Invalid requirement ID'),
    vendorId: z.string().uuid('Invalid vendor ID'),
    notes: z.string().max(1000).optional().nullable(),
    requestedBudget: z.number().min(0).optional().nullable()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const bookingIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const eventBookingsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    eventId: z.string().uuid('Invalid event ID')
  }),
  query: z.object({}).optional()
});

module.exports = { createBookingSchema, bookingIdSchema, eventBookingsSchema };
