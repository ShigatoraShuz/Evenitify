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

// Contract schemas
const createContractSchema = z.object({
  body: z.object({
    termsSummary: z.string().max(2000).optional().nullable()
  }),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const contractBookingIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const contractIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    contractId: z.string().uuid('Invalid contract ID')
  }),
  query: z.object({}).optional()
});

const contractStatusSchema = z.object({
  body: z.object({
    status: z.enum(['sent', 'active', 'completed', 'cancelled'], 'Invalid contract status'),
    reason: z.string().max(500).optional().nullable()
  }),
  params: z.object({
    contractId: z.string().uuid('Invalid contract ID')
  }),
  query: z.object({}).optional()
});

const contractSignSchema = z.object({
  body: z.object({
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms to sign')
  }),
  params: z.object({
    contractId: z.string().uuid('Invalid contract ID')
  }),
  query: z.object({}).optional()
});

module.exports = {
  createBookingSchema,
  bookingIdSchema,
  eventBookingsSchema,
  createContractSchema,
  contractBookingIdSchema,
  contractIdSchema,
  contractStatusSchema,
  contractSignSchema
};
