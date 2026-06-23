const { z } = require('zod');

const vendorVerificationSchema = z.object({
  body: z.object({
    verificationStatus: z.enum(['pending', 'verified', 'rejected'], 'Invalid verification status'),
    reason: z.string().max(500).optional().nullable()
  }),
  params: z.object({
    vendorId: z.string().uuid('Invalid vendor ID')
  }),
  query: z.object({}).optional()
});

const bookingOverrideSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'rejected', 'changes_requested', 'contract_sent', 'confirmed', 'completed', 'cancelled'], 'Invalid booking status'),
    reason: z.string().min(1, 'Reason is required for override').max(500)
  }),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const paginationSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z.string().optional(),
    role: z.string().optional(),
    search: z.string().optional()
  }).optional()
});

module.exports = { vendorVerificationSchema, bookingOverrideSchema, paginationSchema };
