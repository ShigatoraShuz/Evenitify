const { z } = require('zod');

const profileUpdateSchema = z.object({
  body: z.object({
    businessName: z.string().min(1).max(200).optional(),
    businessDescription: z.string().max(1000).optional().nullable(),
    contactNumber: z.string().max(50).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    serviceArea: z.string().max(200).optional().nullable()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const SERVICE_CATEGORIES = Object.freeze([
  'Catering',
  'Lights and sounds',
  'Event styling',
  'Venue decoration',
  'Photography',
  'Videography',
  'Entertainment',
  'Security',
  'Transportation',
  'Equipment rental',
  'Booth setup',
  'Stage production',
  'Event staff',
  'Cleanup crew',
])

const createServiceSchema = z.object({
  body: z.object({
    category: z.enum(SERVICE_CATEGORIES, 'Invalid category'),
    serviceName: z.string().min(1, 'Service name is required').max(200),
    description: z.string().max(1000).optional().nullable(),
    basePrice: z.number().min(0, 'Base price must be non-negative'),
    availabilityStatus: z.enum(['available', 'limited', 'unavailable']).optional(),
    capacity: z.number().int().positive('Capacity must be a positive number').optional(),
    serviceAddress: z.string().max(500).optional().nullable()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateServiceSchema = z.object({
  body: z.object({
    category: z.enum(SERVICE_CATEGORIES).optional(),
    serviceName: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    basePrice: z.number().min(0).optional(),
    availabilityStatus: z.enum(['available', 'limited', 'unavailable']).optional(),
    capacity: z.number().int().positive('Capacity must be a positive number').optional(),
    serviceAddress: z.string().max(500).optional().nullable()
  }),
  params: z.object({
    serviceId: z.string().uuid('Invalid service ID')
  }),
  query: z.object({}).optional()
});

const serviceIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    serviceId: z.string().uuid('Invalid service ID')
  }),
  query: z.object({}).optional()
});

const bookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected', 'changes_requested'], 'Invalid status transition'),
    reason: z.string().max(500).optional().nullable()
  }).refine(
    (data) => data.status !== 'rejected' || (data.reason && data.reason.length > 0),
    { message: 'Reason is required when declining a booking', path: ['reason'] }
  ),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const bookingIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const requestChangesSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Negotiation message is required').max(500)
  }),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

const submitQuoteSchema = z.object({
  body: z.object({
    price: z.number().min(0, 'Price must be non-negative'),
    notes: z.string().max(1000).optional().nullable(),
    validUntil: z.string().datetime().optional().nullable()
  }),
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID')
  }),
  query: z.object({}).optional()
});

module.exports = {
  profileUpdateSchema,
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  bookingStatusSchema,
  bookingIdSchema,
  requestChangesSchema,
  submitQuoteSchema
};
