const { z } = require('zod');

const createRequirementSchema = z.object({
  body: z.object({
    category: z.enum([
      'Catering', 'Lights and Sounds', 'Venue', 'Photo/Video', 'Staff', 'Transport'
    ], 'Invalid category'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    minBudget: z.number().min(0).optional().nullable(),
    maxBudget: z.number().min(0).optional().nullable(),
    notes: z.string().max(500).optional().nullable()
  }),
  params: z.object({
    eventId: z.string().uuid('Invalid event ID')
  }),
  query: z.object({}).optional()
});

const updateRequirementSchema = z.object({
  body: z.object({
    category: z.enum([
      'Catering', 'Lights and Sounds', 'Venue', 'Photo/Video', 'Staff', 'Transport'
    ]).optional(),
    quantity: z.number().int().min(1).optional(),
    minBudget: z.number().min(0).optional().nullable(),
    maxBudget: z.number().min(0).optional().nullable(),
    requirementStatus: z.enum(['open', 'pending_booking', 'fulfilled', 'cancelled']).optional(),
    notes: z.string().max(500).optional().nullable()
  }),
  params: z.object({
    requirementId: z.string().uuid('Invalid requirement ID')
  }),
  query: z.object({}).optional()
});

const requirementIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    requirementId: z.string().uuid('Invalid requirement ID')
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

const vendorSearchSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    minBudget: z.string().optional(),
    maxBudget: z.string().optional(),
    minRating: z.string().optional()
  }).optional()
});

const vendorIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    vendorId: z.string().uuid('Invalid vendor ID')
  }),
  query: z.object({}).optional()
});

module.exports = {
  createRequirementSchema,
  updateRequirementSchema,
  requirementIdSchema,
  eventIdSchema,
  vendorSearchSchema,
  vendorIdSchema
};
